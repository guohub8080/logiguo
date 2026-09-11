/**
 * iro.ColorPicker 构造工厂
 *
 * @jaames/iro 5.5.2 的官方类型把 ColorPicker 声明为普通调用签名（返回 void），
 * 但运行时它是必须 new 的构造器——TS 对 `new iro.ColorPicker(...)` 报 TS2350。
 * 统一从这里创建实例，调用处不再直接 new。
 */
import iro from "@jaames/iro";
import type { IroColorPicker } from "@jaames/iro/dist/ColorPicker";
import type { ColorPickerProps } from "@jaames/iro/dist/ColorPicker";

/** 构造器形态的正确类型（官方 d.ts 漏了 new 签名） */
type IroPickerCtor = new (
    parent: string | HTMLElement,
    props: Partial<ColorPickerProps>,
) => IroColorPicker;

const IroPicker = iro.ColorPicker as unknown as IroPickerCtor;

export function createIroPicker(
    parent: string | HTMLElement,
    props: Partial<ColorPickerProps>,
): IroColorPicker {
    return new IroPicker(parent, props);
}

export type { IroColorPicker, ColorPickerProps };
