import { useMemo } from "react"
import { defaultTo } from "es-toolkit/compat"
import getImgSizeAsync from "./getImgSizeAsync.ts"

const getImgSizeByDefault = (url: string, w?: number, h?: number) => {
    const imgSizeAutoGet = getImgSizeAsync(url)
    const imgSize = useMemo(() => {
        const imgW = defaultTo(w, 0)
        const imgH = defaultTo(h, 0)
        if (imgW + imgH > 0) return { w: imgW, h: imgH }
        if (imgSizeAutoGet.isSuccess) return { w: imgSizeAutoGet.w, h: imgSizeAutoGet.h }
        return { w: imgW, h: imgH }
    }, [imgSizeAutoGet, w, h])
    return imgSize
}

export default getImgSizeByDefault
