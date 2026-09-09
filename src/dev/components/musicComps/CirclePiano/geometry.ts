/**
 * 极坐标几何工具
 * 用于 CirclePiano 的参数化扇形/环形扇区生成
 */

export interface Point {
  x: number
  y: number
}

/**
 * 极坐标转笛卡尔坐标
 * @param cx 圆心 x
 * @param cy 圆心 y
 * @param r 半径
 * @param angleDeg 角度（度），0 = 正上方，顺时针增加
 */
export const polarToXY = (cx: number, cy: number, r: number, angleDeg: number): Point => {
  const rad = (angleDeg - 90) * Math.PI / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

/**
 * 生成环形扇区（annular sector）的 SVG path
 *
 * innerRadius = 0 时，退化为从圆心出发的三角形扇形（pie slice）
 * innerRadius > 0 时，是环形的一段（annular sector，中间镂空）
 *
 * @param cx 圆心 x
 * @param cy 圆心 y
 * @param innerRadius 内半径（0 = 从圆心出发）
 * @param outerRadius 外半径
 * @param startAngle 起始角度（度，0 = 正上方）
 * @param endAngle 终止角度（度）
 */
export const describeAnnularSector = (
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const p1 = polarToXY(cx, cy, outerRadius, startAngle) // 外圆起点
  const p2 = polarToXY(cx, cy, outerRadius, endAngle) // 外圆终点
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  if (innerRadius <= 0) {
    // 三角形扇形：从圆心出发
    return `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`
  }

  // 环形扇区
  const p3 = polarToXY(cx, cy, innerRadius, endAngle) // 内圆终点
  const p4 = polarToXY(cx, cy, innerRadius, startAngle) // 内圆起点
  return [
    `M ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}
