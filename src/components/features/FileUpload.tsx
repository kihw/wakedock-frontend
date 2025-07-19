'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'
import { Card } from '@/views/atoms/Card'
import { useToast } from '@/controllers/hooks/useToast'
import { cn } from '@/lib/utils'

export interface FileUploadProps {
    onFilesChange: (files: File[]) => void
    accept?: string
    multiple?: boolean
    maxFiles?: number
    maxSize?: number // in bytes
    allowedTypes?: string[]
    className?: string
    variant?: 'default' | 'compact' | 'dropzone'
    disabled?: boolean
    placeholder?: string
    showPreview?: boolean
    showProgress?: boolean
}

interface FileWithPreview extends File {
    preview?: string
    progress?: number
    error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesChange,
    accept = "*/*",
    multiple = false,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [],
    className,
    variant = 'default',
    disabled = false,
    placeholder = "Cliquez pour sélectionner des fichiers ou glissez-déposez",
    showPreview = true,
    showProgress = true
}) => {
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { addToast } = useToast()

    // Validate file
    const validateFile = useCallback((file: File): string | null => {
        if (file.size > maxSize) {
            return `Le fichier "${file.name}" est trop volumineux (${formatFileSize(file.size)} > ${formatFileSize(maxSize)})`
        }

        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return `Le type de fichier "${file.type}" n'est pas autorisé`
        }

        return null
    }, [maxSize, allowedTypes])

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Create file preview
    const createFilePreview = useCallback((file: File): Promise<string> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsDataURL(file)
            } else {
                resolve('')
            }
        })
    }, [])

    // Process files
    const processFiles = useCallback(async (fileList: FileList) => {
        const newFiles: FileWithPreview[] = []

        for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
            const file = fileList[i]
            const error = validateFile(file)

            if (error) {
                addToast(error, 'error')
                continue
            }

            const preview = await createFilePreview(file)
            const fileWithPreview: FileWithPreview = Object.assign(file, {
                preview,
                progress: 0,
                error: undefined
            })

            newFiles.push(fileWithPreview)
        }

        if (files.length + newFiles.length > maxFiles) {
            addToast(`Vous ne pouvez sélectionner que ${maxFiles} fichiers maximum`, 'warning')
            return
        }

        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesChange(updatedFiles)

        if (newFiles.length > 0) {
            addToast(`${newFiles.length} fichier(s) ajouté(s)`, 'success')
        }
    }, [files, maxFiles, validateFile, createFilePreview, addToast, onFilesChange])

    // Handle file input change
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList && fileList.length > 0) {
            processFiles(fileList)
        }
    }, [processFiles])

    // Handle drag events
    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)

        const fileList = event.dataTransfer.files
        if (fileList && fileList.length > 0) {
            processFiles(fileList)
        }
    }, [processFiles])

    // Remove file
    const removeFile = useCallback((index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        setFiles(updatedFiles)
        onFilesChange(updatedFiles)
        addToast('Fichier supprimé', 'info')
    }, [files, onFilesChange, addToast])

    // Clear all files
    const clearFiles = useCallback(() => {
        setFiles([])
        onFilesChange([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        addToast('Tous les fichiers ont été supprimés', 'info')
    }, [onFilesChange, addToast])

    // Get file icon
    const getFileIcon = (file: File) => {
        const type = file.type.split('/')[0]
        switch (type) {
            case 'image':
                return (
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )
            case 'video':
                return (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )
            case 'audio':
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )
        }
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter fichier
                </Button>

                {files.length > 0 && (
                    <Badge variant="secondary">
                        {files.length} fichier{files.length > 1 ? 's' : ''}
                    </Badge>
                )}
            </div>
        )
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Drop Zone */}
            <Card className={cn(
                'relative border-2 border-dashed transition-all duration-300 cursor-pointer',
                isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600',
                disabled && 'opacity-50 cursor-not-allowed'
            )}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />

                <div
                    className="p-8 text-center"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <motion.div
                        animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {isDragOver ? 'Relâchez pour déposer' : placeholder}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {multiple ? `Jusqu'à ${maxFiles} fichiers` : 'Un seul fichier'} •
                                Max {formatFileSize(maxSize)}
                            </p>
                            {allowedTypes.length > 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Types autorisés: {allowedTypes.join(', ')}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </Card>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Fichiers sélectionnés ({files.length})
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFiles}
                                className="text-xs"
                            >
                                Tout supprimer
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            {files.map((file, index) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    {/* File Icon/Preview */}
                                    <div className="flex-shrink-0">
                                        {showPreview && file.preview ? (
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(file.size)} • {file.type}
                                        </p>

                                        {/* Progress Bar */}
                                        {showProgress && file.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Upload</span>
                                                    <span>{file.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                    <div
                                                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                        style={{ width: `${file.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Error */}
                                        {file.error && (
                                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default FileUpload
