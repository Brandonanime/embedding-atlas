// Copyright (c) 2025 Apple Inc. Licensed under MIT License.

export function isWebGPUAvailable(): boolean {
  if (navigator.gpu == undefined || navigator.gpu.requestAdapter == undefined) {
    return false;
  }
  return true;
}

function correctedBufferSize(size: number): number {
  if (size == 0) {
    size = 4;
  }
  if (size % 4 != 0) {
    size += 4 - (size % 4);
  }
  return size;
}

export function gpuBuffer(
  state: {
    buffer?: GPUBuffer;
    byteSize?: number;
    usage?: GPUBufferUsageFlags;
    destroy?: () => void;
  },
  device: GPUDevice,
  byteSize: number,
  usage: GPUBufferUsageFlags,
): GPUBuffer {
  if (state.buffer == null || state.byteSize != byteSize || state.usage != usage) {
    if (state.buffer != null) {
      state.buffer.destroy();
    }
    state.buffer = device.createBuffer({ size: correctedBufferSize(byteSize), usage: usage });
    state.byteSize = byteSize;
    state.destroy = () => {
      state.buffer?.destroy();
    };
  }
  return state.buffer;
}

export function gpuBufferData(
  state: {
    buffer?: GPUBuffer;
    data?: BufferSource | null;
    destroy?: () => void;
  },
  device: GPUDevice,
  buffer: GPUBuffer,
  data: BufferSource | null,
) {
  if (state.buffer !== buffer || state.data !== data) {
    if (data != null) {
      if (data.byteLength % 4 != 0) {
        let n = data.byteLength - (data.byteLength % 4);
        device.queue.writeBuffer(buffer, 0, data, 0, n);
        if (data instanceof Uint8Array) {
          let remaining = new Uint8Array(4);
          for (let i = 0; i < 4; i++) {
            if (n + i < data.length) {
              remaining[i] = data[n + i];
            }
          }
          device.queue.writeBuffer(buffer, n, remaining);
        }
      } else {
        device.queue.writeBuffer(buffer, 0, data, 0);
      }
    } else {
      device.queue.writeBuffer(buffer, 0, new ArrayBuffer(buffer.size));
    }
    state.buffer = buffer;
    state.data = data;
  }
  return buffer;
}

export function gpuTexture(
  state: {
    texture?: GPUTexture;
    width?: number;
    height?: number;
    format?: GPUTextureFormat;
    usage?: GPUTextureUsageFlags;
    destroy?: () => void;
  },
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  usage: GPUTextureUsageFlags,
): GPUTexture {
  if (
    state.texture == null ||
    state.width != width ||
    state.height != height ||
    state.format != format ||
    state.usage != usage
  ) {
    if (state.texture != null) {
      state.texture.destroy();
    }
    state.texture = device.createTexture({ size: [width, height], format: format, usage: usage });
    state.destroy = () => {
      state.texture?.destroy();
    };
  }
  return state.texture;
}
