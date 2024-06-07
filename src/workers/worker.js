// Function to parse CSV data
function parseCSV(data) {
  const lines = data.split('\n');
  const headers = lines[0].split(',');

  const records = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : null;
      return obj;
    }, {});
  });

  return records.filter(record => record['DATE&TIME']);
}

// Function to perform Largest-Triangle-Three-Buckets (LTTB) algorithm for data simplification
function lttb(data, threshold) {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) {
    return data; // Dataset is small, nothing to do
  }

  const sampled = [];
  const every = (dataLength - 2) / (threshold - 2);
  let a = 0;  // a is the first point initially
  let maxArea;
  let area;
  let nextA;

  sampled.push(data[a]);  // Always add the first point

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * every) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * every) + 1, dataLength);
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let { avgX, avgY } = data.slice(avgRangeStart, avgRangeEnd).reduce(
      (acc, point) => {
        acc.avgX += point.x;
        acc.avgY += point.y;
        return acc;
      },
      { avgX: 0, avgY: 0 }
    );

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    const rangeOffs = Math.floor(i * every) + 1;
    const rangeTo = Math.min(Math.floor((i + 1) * every) + 1, dataLength);

    const pointAX = data[a].x;
    const pointAY = data[a].y;

    maxArea = area = -1;

    for (let j = rangeOffs; j < rangeTo; j++) {
      area = Math.abs(
        (pointAX - avgX) * (data[j].y - pointAY) -
        (pointAX - data[j].x) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        nextA = j; // Next a is the point with the max area
      }
    }

    sampled.push(data[nextA]); // Pick this point from the bucket
    a = nextA; // This a is the next a (chosen point)
  }

  sampled.push(data[dataLength - 1]); // Always add the last point

  return sampled;
}

// Function to aggregate data using the LTTB algorithm
function aggregateData(data, threshold = 10000) {
  if (data.length <= threshold) return data;

  const points = data.map((d, i) => ({
    x: new Date(d['DATE&TIME']).getTime(),
    y: parseFloat(d['LAFMAX']),
    index: i
  }));

  const simplified = lttb(points, threshold);
  return simplified.map(d => data[d.index]);
}

// Function to calculate noise levels
function calculateNoiseLevels(data) {
  const lafmaxValues = data.map(d => parseFloat(d['LAFMAX']));
  const sum = lafmaxValues.reduce((a, b) => a + b, 0);
  const mean = sum / lafmaxValues.length;

  const squaredDiffs = lafmaxValues.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return { mean, stdDev };
}

self.onmessage = async function(e) {
  const { data, action } = e.data;

  if (action === 'parse') {
    const parsedData = parseCSV(data);
    const aggregatedData = aggregateData(parsedData);
    const noiseLevels = calculateNoiseLevels(parsedData); // Use all data for calculations
    self.postMessage({ action: 'parsed', data: aggregatedData, noiseLevels });
  }
};
