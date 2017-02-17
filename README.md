# Test Voice Insights event tracking

I created this repo in order to test out my changes to the
Voicelabs co node SDK to support promises as well as to
test out how events are tracked depending upon lambda
function handling.

This lambda function is managed using [`apex`](http://apex.run).

Once you have set up apex and updated to an appropriate role
in `project.json`, you can use `apex deploy` to deploy the
function and `apex invoke` to test out the different scenarios.

I will use `apex` in the examples for running the scenarios.

## Installation
Run `yarn install` to install dependencies. Install `apex`
if you have not already. You will have to manually update
`project.json` to set an appropriate role. Then you can
deploy the lambda function with the `VI_APP_TOKEN` environment
variable set to the VoiceLabs token that you want to test.

## My findings:

### 1. `apex invoke`
In this scenario, the lambda function completes without
using `context.succeed` or the `callback` so it should wait
until the event loop complets.

:white_check_mark: The event is recorded appropriately and immediately

### 2. `echo '{"useAsyncCb": true} | apex invoke`
The Lambda function `callback` is called explicitly. This is
done in the same event loop as the call to `.track`. We
expect the event loop to complete and `.track` to finish
before the callback completes and the lambda function exits.

:white_check_mark: The event is recorded appropriately and immediately

### 3. `echo '{"useCb": true} | apex invoke`
Lambda `callback` is called _after_ `.track` completes
asynchronously, i.e. call to `callback` is synchronized.

The event loop should already be empty by the time `callback`
is called anyway, so this should be the same as the first test.

:white_check_mark: The event is recorded appropriately and immediately

### 4. `echo '{"useCtx": true} | apex invoke`
This uses the old style Lambda completion mechanism with
`context.succeed`. This should not wait for the event
loop to complete before finishing the lambda function.

:red_circle: The event is not recorded

Strangely, if a test 1-3 is run after test 4, both events will
get recorded. However, event 4 never seems to get recorded
unless or until another test type is run.

## Conclusion
Using `callback` (or nothing) to signal the completion of a
lambda function is preferred. `VoiceInsights.track` performs
an asynchronous operation and the lambda function should
wait for the event loop to complete before exiting.
Otherwise the behavior is unexpected.

Note that currently the `alexa-app` SDK I am most familiar
with uses `context` in its default lambda handler
implementation. [This should be changed in a later version](https://github.com/alexa-js/alexa-app/issues/188)
