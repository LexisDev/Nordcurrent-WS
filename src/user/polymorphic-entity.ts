import Entity from "./entity";

export default abstract class PolymorphicEntity extends Entity {
    public abstract attributes(): Record<string, string>;

    public hydrate(data: Record<string, any>): void {
        for (const [key, property] of Object.entries(this.attributes())) {
            if (data[key] !== undefined) {
                (this as any)[property] = data[key];
            }
        }
    }

    public extract(): Record<string, any> {
        const out: Record<string, any> = {};
        for (const [key, property] of Object.entries(this.attributes())) {
            out[key] = (this as any)[property];
        }
        return out;
    }

    public getSnapshot(_time: number): any {
        return this.extract();
    }
}
