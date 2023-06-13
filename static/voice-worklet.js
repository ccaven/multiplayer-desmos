/**
 * Adds hiss into each channel.
 *
 * @class VoiceProcessor
 * @extends AudioWorkletProcessor
 **/

class VoiceProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    static get parameterDescriptors() {
        return [
            {
                name: "gain",
                defaultValue: 0.2,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    /**
     * Called by the browser's audio subsystem with
     * packets of audio data to be processed.
     *
     * @param[in] inputList    Array of inputs
     * @param[in] outputList   Array of outputs
     * @param[in] parameters   Parameters object
     *
     * `inputList` and `outputList` are each arrays of inputs
     * or outputs, each of which is in turn an array of `Float32Array`s,
     * each of which contains the audio data for one channel (left/right/etc)
     * for the current sample packet.
     *
     * `parameters` is an object containing the `AudioParam` values
     * for the current block of audio data.
     **/

    process(inputList, outputList, parameters) {
        const gain = parameters.gain[0];
        const sourceLimit = Math.min(inputList.length, outputList.length);

        const THRESHOLD = 0.025;

        for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
            let input = inputList[inputNum];
            let output = outputList[inputNum];
            let channelCount = Math.min(input.length, output.length);

            // The input list and output list are each arrays of
            // Float32Array objects, each of which contains the
            // samples for one channel.

            for (let channel = 0; channel < channelCount; channel++) {

                let sampleCount = input[channel].length;
                let maxAmplitude = 0;
                for (let i = 0; i < sampleCount; i++) {
                    let sample = input[channel][i];
                    if (sample > maxAmplitude) maxAmplitude = sample;
                }

                let normalizedSamples = new Float32Array(sampleCount);
                if (maxAmplitude > THRESHOLD) {
                    // Normalize amplitude to THRESHOLD
                    for (let i = 0; i < sampleCount; i++) {
                        normalizedSamples = input[channel][i] * THRESHOLD / maxAmplitude;
                    }
                } else {
                    for (let i = 0; i < sampleCount; i++) {
                        normalizedSamples = input[channel][i];
                    }
                }

                for (let i = 0; i < sampleCount; i++) {

                    let sample = input[channel][i];
                    
                    let normalized = sample;
                    if (maxAmplitude > THRESHOLD) {
                        normalized *= THRESHOLD / maxAmplitude;
                    }

                    // Prevent clipping
                    if (sample > 1.0) {
                        sample = 1.0;
                    } else if (sample < -1.0) {
                        sample = -1.0;
                    }

                    output[channel][i] = sample - normalized;
                }
            }
        }

        // Return; let the system know we're still active
        // and ready to process audio.

        return true;
    }
}

registerProcessor("voice-worklet", VoiceProcessor);
