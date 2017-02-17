import VoiceInsights from "voice-insights-sdk";

export default (event, ctx, callback) => {
    VoiceInsights.initialize({sessionId: "fake", user: {userId: "fake"}}, process.env.VI_APP_TOKEN);
    if (event.useCtx) {
        VoiceInsights.track("fakeIntentNameCtx", [], "fake speech using ctx");
        ctx.succeed('done');
    }
    else if (event.useAsyncCb) {
        VoiceInsights.track("fakeIntentNameCb", [], "fake speech using cb");
        callback();
    }
    else if (event.useCb) {
        VoiceInsights.track("fakeIntentNameSyncCb", [], "fake speech using sync cb").then(callback);
    }
    else {
        VoiceInsights.track("fakeIntentNameReturn", [], "fake speech using nothing");
    }
};
