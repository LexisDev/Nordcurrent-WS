function Mixin(...traits: any[]) {
    return <T extends { new (...args: any[]): {} }>(constructor: T): T => {
        class Decorated extends constructor {}
        const prototype = Decorated.prototype;
        for (const trait of traits) {
            for (const method in trait) {
                if (!constructor.prototype.hasOwnProperty(method) && !prototype.hasOwnProperty(method)) {
                    prototype[method] = trait[method];
                }
            }
        }
        return Decorated as unknown as T;
    };
}

export const getClassName = (c: any): string => {
    const name = c.__proto__.constructor.name;
    return name !== "Decorated" ? name : getClassName(c.__proto__);
};

export default Mixin;
