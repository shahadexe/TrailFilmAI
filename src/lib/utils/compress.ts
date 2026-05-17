import imageCompression from 'browser-image-compression'

export async function compressPhoto(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
    initialQuality: 0.85,
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Compression failed, using original:', error)
    return file
  }
}
