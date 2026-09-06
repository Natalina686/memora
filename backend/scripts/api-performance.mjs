import { performance } from 'node:perf_hooks';

const BASE_URL =
  process.env.BASE_URL ??
  'http://localhost:3000/api/v1';

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error(
    'TOKEN is required. Run: TOKEN="..." node scripts/api-performance.mjs',
  );

  process.exit(1);
}

const endpoints = [
  {
    name: 'Learning Progress',
    path: '/learning-progress',
  },
  {
    name: 'Review Schedule',
    path: '/review-schedule',
  },
  {
    name: 'Quiz Sessions',
    path: '/quiz-sessions',
  },
];

function percentile(values, p) {
  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const index = Math.ceil(
    (p / 100) * sorted.length,
  ) - 1;

  return sorted[
    Math.max(
      0,
      Math.min(index, sorted.length - 1),
    )
  ];
}

function summarize(
  name,
  durations,
  errors,
  wallTime,
) {
  const sum = durations.reduce(
    (total, value) => total + value,
    0,
  );

  const average =
    durations.length > 0
      ? sum / durations.length
      : 0;

  const successful =
    durations.length;

  const total =
    successful + errors;

  return {
    name,
    requests: total,
    successful,
    errors,
    successRate:
      total > 0
        ? `${(
            (successful / total) *
            100
          ).toFixed(2)}%`
        : '0%',

    minMs:
      durations.length > 0
        ? Math.min(...durations).toFixed(2)
        : '0.00',

    avgMs:
      average.toFixed(2),

    p50Ms:
      durations.length > 0
        ? percentile(
            durations,
            50,
          ).toFixed(2)
        : '0.00',

    p95Ms:
      durations.length > 0
        ? percentile(
            durations,
            95,
          ).toFixed(2)
        : '0.00',

    maxMs:
      durations.length > 0
        ? Math.max(...durations).toFixed(2)
        : '0.00',

    requestsPerSecond:
      wallTime > 0
        ? (
            (total / wallTime) *
            1000
          ).toFixed(2)
        : '0.00',
  };
}

async function request(path) {
  const start =
    performance.now();

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    },
  );

  await response.text();

  const duration =
    performance.now() - start;

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`,
    );
  }

  return duration;
}

async function sequentialTest(
  endpoint,
  requestCount = 50,
) {
  const durations = [];
  let errors = 0;

  // Warm-up
  for (let i = 0; i < 5; i += 1) {
    try {
      await request(endpoint.path);
    } catch {
      // Ignore warm-up failures here.
    }
  }

  const wallStart =
    performance.now();

  for (
    let i = 0;
    i < requestCount;
    i += 1
  ) {
    try {
      durations.push(
        await request(
          endpoint.path,
        ),
      );
    } catch (error) {
      errors += 1;

      console.error(
        `${endpoint.name}:`,
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }

  const wallTime =
    performance.now() -
    wallStart;

  return summarize(
    `${endpoint.name} — sequential`,
    durations,
    errors,
    wallTime,
  );
}

async function loadTest(
  endpoint,
  totalRequests = 200,
  concurrency = 10,
) {
  const durations = [];
  let errors = 0;
  let nextRequest = 0;

  async function worker() {
    while (true) {
      const current =
        nextRequest;

      nextRequest += 1;

      if (
        current >=
        totalRequests
      ) {
        return;
      }

      try {
        durations.push(
          await request(
            endpoint.path,
          ),
        );
      } catch (error) {
        errors += 1;

        console.error(
          `${endpoint.name}:`,
          error instanceof Error
            ? error.message
            : error,
        );
      }
    }
  }

  const wallStart =
    performance.now();

  await Promise.all(
    Array.from(
      { length: concurrency },
      () => worker(),
    ),
  );

  const wallTime =
    performance.now() -
    wallStart;

  return summarize(
    `${endpoint.name} — load (${totalRequests} requests, concurrency ${concurrency})`,
    durations,
    errors,
    wallTime,
  );
}

console.log(
  '\nMEMORA API PERFORMANCE TEST\n',
);

console.log(
  `Base URL: ${BASE_URL}`,
);

console.log(
  `Node: ${process.version}\n`,
);

console.log(
  '=== Sequential latency ===\n',
);

for (const endpoint of endpoints) {
  const result =
    await sequentialTest(
      endpoint,
      50,
    );

  console.table([result]);
}

console.log(
  '\n=== Load test ===\n',
);

const loadResult =
  await loadTest(
    {
      name:
        'Learning Progress',
      path:
        '/learning-progress',
    },
    200,
    10,
  );

console.table([
  loadResult,
]);

console.log(
  '\nPerformance test completed.\n',
);
