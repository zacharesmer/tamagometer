// These should probably just be methods in the serial connection object. 
// I put them here because jest can't even look at a file that uses the serial API without exploding

export { matchCommandString, matchTimedOutString }

function matchCommandString(commandMatched: { matchingChars: number, commandSoFar: string[] }, newString: string): { complete: boolean, commandMatched: { matchingChars: number, commandSoFar: string[] } } {
    // DIY regex for matching in place
    // This is kind of ridiculous and I will probably change it to a regular old regex at some point
    let { matchingChars, commandSoFar } = commandMatched
    const beginning = "[PICO]";
    const end = "[END]";
    const end_offset = 160 + beginning.length;
    const total_length = 160 + beginning.length + end.length;

    for (let i = 0; i < newString.length; i++) {
        let current = newString[i].toString();
        // console.log(`current: ${current}, command so far: ${command}, characters matched: ${matching_chars}`);
        // if we are in the header and match it, continue
        if (matchingChars < beginning.length && current === beginning[matchingChars]) {
            matchingChars++;
            // command.push(current);
        }
        // if we are in the main body and see a 1 or 0, continue and push it onto the thing we're saving
        else if (matchingChars < end_offset && (current === "0" || current === "1")) {
            commandSoFar.push(current);
            matchingChars++;
        }
        // if we're in the end and the character matches, continue
        else if (matchingChars >= end_offset && current === end[matchingChars - end_offset]) {
            matchingChars++;
        }
        // if none of those things happened then the pattern doesn't match.
        // reset the counter and clear out the recording to wait for a new one
        else {
            commandSoFar = [];
            matchingChars = 0;
        }

        // If the entire pattern has been matched, return it
        if (matchingChars === total_length) {
            return { complete: true, commandMatched: { matchingChars, commandSoFar } }
        }
    }
    // If the entire pattern wasn't matched, return any progress
    return { complete: false, commandMatched: { matchingChars, commandSoFar } }
}

function matchTimedOutString(matchingChars: number, newString: string): { complete: boolean, matchingChars: number } {
    const timedOutString = "[PICO]timed out[END]";

    for (let i = 0; i < newString.length; i++) {
        let current = newString[i].toString();
        // In this case, the next character matches
        if (current === timedOutString[matchingChars]) {
            matchingChars++;
        } else {
            matchingChars = 0;
        }
        // If the entire timedOutString has been matched, return
        if (matchingChars === timedOutString.length) {
            // console.log("Timed out")
            return { complete: true, matchingChars };
        }
    }
    // If nothing in newString matched the timedOutString, return the progress (if any)
    return { complete: false, matchingChars }
}

