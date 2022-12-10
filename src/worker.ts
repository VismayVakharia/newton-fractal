import { Polynomial } from "../modules/polynomial";

const ctx: Worker = self as any;

ctx.addEventListener("message", function (ev: MessageEvent) {
    const result = new Polynomial(ev.data, true);
    console.log("Worker: Message received from main script");
    postMessage(result.differentiate());
    console.log('Worker: Posting message back to main script');
})
