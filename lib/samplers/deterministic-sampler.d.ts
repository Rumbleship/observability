export declare class DeterministicSampler {
    protected sample_rate: number;
    constructor(sample_rate: number);
    sample(event_data: object): {
        shouldSample: boolean;
        sampleRate: number;
    };
}
