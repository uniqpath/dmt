export interface PointerEvaluation {
    parent: any;
    key: string;
    value: any;
}
/**
JSON Pointer representation
*/
export declare class Pointer {
    tokens: string[];
    constructor(tokens?: string[]);
    /**
    `path` *must* be a properly escaped string.
    */
    static fromJSON(path: string): Pointer;
    toString(): string;
    /**
    Returns an object with 'parent', 'key', and 'value' properties.
    In the special case that this Pointer's path == "",
    this object will be {parent: null, key: '', value: object}.
    Otherwise, parent and key will have the property such that parent[key] == value.
    */
    evaluate(object: any): PointerEvaluation;
    get(object: any): any;
    set(object: any, value: any): void;
    push(token: string): void;
    /**
    `token` should be a String. It'll be coerced to one anyway.
  
    immutable (shallowly)
    */
    add(token: string): Pointer;
}
