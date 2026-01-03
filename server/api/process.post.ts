import sharp from 'sharp'

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded'
        })
    }

    const file = formData.find(item => item.name === 'image')
    const quality = parseInt(formData.find(item => item.name === 'quality')?.data.toString() || '85')
    const format = formData.find(item => item.name === 'format')?.data.toString() || 'webp'

    if (!file) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Image file is required'
        })
    }

    try {
        let pipeline = sharp(file.data)

        // Note: Dimensions are handled by client-side cropper for "What You See Is What You Get" accuracy.
        // However, if we wanted server-side resizing we would read width/height from formData.
        // For now, we trust the blob sent from client is already cropped/resized, 
        // and we focus on compression and format conversion.

        // But if the client sends high-res cropped image and wants strict resize:
        // const width = ...
        // const height = ...
        // pipeline.resize(width, height)

        // Format conversion and compression
        if (format === 'webp') {
            pipeline = pipeline.webp({ quality, smartSubsample: true })
        } else if (format === 'avif') {
            pipeline = pipeline.avif({ quality, effort: 4 })
        } else if (format === 'jpeg' || format === 'jpg') {
            pipeline = pipeline.jpeg({ quality, mozjpeg: true })
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality: quality < 100 ? 80 : 100 })
        }

        const buffer = await pipeline.toBuffer()

        setResponseHeader(event, 'Content-Type', `image/${format}`)
        setResponseHeader(event, 'Content-Disposition', `attachment; filename="processed.${format}"`)

        return buffer
    } catch (error) {
        console.error('Image processing error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Image processing failed'
        })
    }
})
