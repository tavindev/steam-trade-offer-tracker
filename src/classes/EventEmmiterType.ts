import { EventEmitter } from "events";

interface EventEmitterEvents {
    [event: string]: any[];
}

export abstract class EventEmitterType<
    T extends EventEmitterEvents
> extends EventEmitter {
    protected constructor() {
        super();
    }

    addListener<K extends keyof T>(
        event: K,
        listener: (...args: T[Extract<string, K>]) => void
    ) {
        return super.addListener(event, listener as (...args: any[]) => void);
    }

    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void) {
        return super.on(event, listener as (...args: any[]) => void);
    }

    emit<K extends keyof T>(event: K, ...data: T[K]) {
        return super.emit(event, data);
    }
}
