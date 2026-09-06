// Lossless metadata removal: encoded image scans are copied, never recompressed.
export function inspectJpeg(input) {
  if (!Buffer.isBuffer(input) || input.length < 4 || input.readUInt16BE(0) !== 0xffd8) {
    throw new Error("INVALID_JPEG");
  }
  const segments = [];
  let width = 0;
  let height = 0;
  let offset = 2;
  let hasScan = false;
  while (offset < input.length) {
    const start = offset;
    if (input[offset++] !== 0xff) throw new Error("INVALID_JPEG_MARKER");
    while (input[offset] === 0xff) offset++;
    const marker = input[offset++];
    if (marker === 0xd9) {
      if (!width || !height || !hasScan) throw new Error("INCOMPLETE_JPEG");
      segments.push({ marker, start, end: offset });
      return { width, height, segments, end: offset };
    }
    if (marker === undefined || marker === 0 || marker === 0xd8 ||
        (marker >= 0xd0 && marker <= 0xd7) || offset + 2 > input.length) {
      throw new Error("INVALID_JPEG_MARKER");
    }
    const length = input.readUInt16BE(offset);
    if (length < 2 || offset + length > input.length) throw new Error("TRUNCATED_JPEG");
    const payload = offset + 2;
    offset += length;
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 8) throw new Error("INVALID_JPEG_FRAME");
      height = input.readUInt16BE(payload + 1);
      width = input.readUInt16BE(payload + 3);
    }
    segments.push({ marker, start, end: offset, payload });
    if (marker === 0xda) {
      hasScan = true;
      const scanStart = offset;
      // Progressive JPEGs can have multiple scans separated by metadata/tables.
      while (offset < input.length) {
        if (input[offset] !== 0xff) { offset++; continue; }
        let next = offset + 1;
        while (input[next] === 0xff) next++;
        if (input[next] === 0 || (input[next] >= 0xd0 && input[next] <= 0xd7)) {
          offset = next + 1;
          continue;
        }
        break;
      }
      segments.push({ marker: null, start: scanStart, end: offset });
    }
  }
  throw new Error("MISSING_JPEG_END");
}

export function stripJpegMetadata(input) {
  const { segments } = inspectJpeg(input);
  const chunks = [input.subarray(0, 2)];
  for (const segment of segments) {
    const { marker, start, end, payload } = segment;
    if (marker === 0xfe) continue; // Comments can disclose titles or locations.
    if (marker >= 0xe0 && marker <= 0xef) {
      const prefix = input.subarray(payload, end).toString("ascii");
      const keep = (marker === 0xe0 && prefix.startsWith("JFIF\0")) ||
        (marker === 0xe2 && prefix.startsWith("ICC_PROFILE\0")) ||
        (marker === 0xee && prefix.startsWith("Adobe"));
      if (!keep) continue;
    }
    chunks.push(input.subarray(start, end));
  }
  return Buffer.concat(chunks);
}
