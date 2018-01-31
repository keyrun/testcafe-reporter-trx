var assert           = require('assert');
var normalizeNewline = require('normalize-newline');
var read             = require('read-file-relative').readSync;
var createReport     = require('./utils/create-report');
var regex            = /((id)|(relativeResultsDirectory))="([\w-]+)"/gim;

it('Should produce report with colors', function () {
    var report   = createReport(true);
    var expected = JSON.parse(read('./data/report-with-colors.json'));

    report   = normalizeNewline(report).trim().replace(regex, '$1=""');
    expected = normalizeNewline(expected).trim().replace(regex, '$1=""');

    assert.strictEqual(report, expected);
});

it('Should produce report without colors', function () {
    var report   = createReport(false);
    var expected = read('./data/report-without-colors');

    report   = normalizeNewline(report).trim().replace(regex, '$1=""');
    expected = normalizeNewline(expected).trim().replace(regex, '$1=""');

    assert.strictEqual(report, expected);
});
