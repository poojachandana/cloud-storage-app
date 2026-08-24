import { FileText, FileImage, FileVideo, FileAudio, FileArchive, FileCode, File } from 'lucide-react'

export function iconForFile(contentType = '', name = '') {
  const ext = name.split('.').pop()?.toLowerCase()

  if (contentType.startsWith('image/')) return FileImage
  if (contentType.startsWith('video/')) return FileVideo
  if (contentType.startsWith('audio/')) return FileAudio
  if (contentType === 'application/pdf' || ['doc', 'docx', 'txt', 'md'].includes(ext)) return FileText
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return FileArchive
  if (['js', 'jsx', 'ts', 'tsx', 'java', 'py', 'html', 'css', 'json'].includes(ext)) return FileCode

  return File
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
