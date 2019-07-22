const TRX = require('node-trx');
const os = require('os');

const computerName = os.hostname();
const userName = os.userInfo().username;
const TestRun = TRX.TestRun;
const UnitTest = TRX.UnitTest;
const newLine = os.EOL;

export default function () {
    return {
        noColors: true,
        
        reportTaskStart (startTime/*, userAgents, testCount*/) {
            this.startTime = startTime;
            this.tests = [];
        },

        reportFixtureStart (name, path) {
            this.fixtureName = name;
            this.path = path;
        },

        reportTestDone (name, testRunInfo) {
            const end = new Date(+this.startTime + testRunInfo.durationMs);
            const hasErr = !!testRunInfo.errs.length;
            let result = hasErr ? `Failed` : `Passed`;

            result = testRunInfo.skipped ? 'NotExecuted' : result;
            const testResults = {};

            testResults.name = `test "${name}" in fixture "${this.fixtureName}"`;
            if (hasErr)
                testResults.errs = testRunInfo.errs;
            testResults.outcome = result;
            testResults.duration = testRunInfo.durationMs;
            testResults.start = this.testStartTime;
            testResults.end = end;
            this.tests.push(testResults);
        },

        reportTaskDone (endTime/*, passed, warnings*/) {
            const now = endTime.toISOString();
            const testRunName = userName + '@' + computerName + ' ' + now.substring(0, now.indexOf('.')).replace('T', ' ');
            const run = new TestRun({
                name:     testRunName,
                runUser:  userName,
                settings: {
                    name: 'default'
                },
                times: {
                    creation: now,
                    queuing:  now,
                    start:    this.startTime.toISOString(),
                    finish:   endTime.toISOString()
                }
            });
            
            this.tests.map((test) => {
                const unittest = new UnitTest({
                    name:            test.name,
                    methodCodeBase:  'none',
                    methodName:      'none',
                    methodClassName: 'none'
                });
                const errorMessage    = test.errs ? `${test.name} encountered errors` : '';
                let errorStacktrace = '';

                if (test.errs) {
                    test.errs.map((err, idx) => {
                        const prefix = this.chalk.red(`${idx + 1}) `);

                        errorStacktrace += this.formatError(err, prefix) + newLine;
                    });
                }

                run.addResult({
                    test:            unittest,
                    computerName:    computerName,
                    outcome:         test.outcome,
                    duration:        formatDuration(test.duration || 0),
                    startTime:       test.start && test.start.toISOString() || '',
                    endTime:         test.end && test.end.toISOString() || '',
                    errorMessage:    errorMessage,
                    errorStacktrace: errorStacktrace
                });
            });
            this.write(run.toXml());
        }
    };
}

function formatDuration (milliseconds) {
    // we get duration ISO string
    var duration = (new Date(milliseconds)).toISOString();

    // we return time part only and remove Z char
    return duration.substring(duration.indexOf('T') + 1).replace('Z', '');
}
