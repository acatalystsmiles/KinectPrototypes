/**
 * Automated Test Runner
 * Runs all test suites and generates comprehensive reports
 */

const { TestFramework } = require('./TestFramework.js');
const fs = require('fs').promises;
const path = require('path');

// Test suite imports
const unitTests = require('./unit/movement-analysis.test.js');
const integrationTests = require('./integration/data-pipeline.test.js');
const performanceTests = require('./performance/multi-person-performance.test.js');
const recordedDataTests = require('./automated/recorded-data-tests.js');
const loadTests = require('./load/extended-operation.test.js');

// Test runner configuration
const TEST_CONFIG = {
    outputDirectory: './tests/reports',
    generateHTMLReport: true,
    generateJSONReport: true,
    exitOnFailure: false,
    parallel: false, // Set to true for parallel execution
    timeouts: {
        unit: 30000,        // 30 seconds
        integration: 60000,  // 1 minute
        performance: 300000, // 5 minutes
        automated: 180000,   // 3 minutes
        load: 1800000       // 30 minutes
    }
};

// Comprehensive test runner
class ComprehensiveTestRunner {
    constructor() {
        this.testSuites = new Map();
        this.results = new Map();
        this.startTime = null;
        this.endTime = null;
        this.overallResults = {
            totalSuites: 0,
            passedSuites: 0,
            failedSuites: 0,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
            errors: []
        };
    }

    registerTestSuite(name, testFramework, category = 'general') {
        this.testSuites.set(name, {
            name,
            framework: testFramework,
            category,
            timeout: TEST_CONFIG.timeouts[category] || TEST_CONFIG.timeouts.unit
        });
    }

    async runAllTests() {
        console.log('🧪 Kinect Sound Sculpture - Comprehensive Test Suite');
        console.log('═'.repeat(80));

        this.startTime = Date.now();

        try {
            await this.ensureOutputDirectory();
            await this.registerAllTestSuites();

            if (TEST_CONFIG.parallel) {
                await this.runTestSuitesInParallel();
            } else {
                await this.runTestSuitesSequentially();
            }

            await this.generateReports();
            this.printFinalSummary();

        } catch (error) {
            console.error('💥 Test runner failed:', error);
            this.overallResults.errors.push(error.message);
        } finally {
            this.endTime = Date.now();
            this.overallResults.totalDuration = this.endTime - this.startTime;
        }

        return this.overallResults;
    }

    async ensureOutputDirectory() {
        try {
            await fs.access(TEST_CONFIG.outputDirectory);
        } catch {
            await fs.mkdir(TEST_CONFIG.outputDirectory, { recursive: true });
        }
    }

    async registerAllTestSuites() {
        // Register all test suites with their categories
        this.registerTestSuite('Unit Tests - Movement Analysis', unitTests.testFramework, 'unit');
        this.registerTestSuite('Integration Tests - Data Pipeline', integrationTests.testFramework, 'integration');
        this.registerTestSuite('Performance Tests - Multi-Person', performanceTests.testFramework, 'performance');
        this.registerTestSuite('Automated Tests - Recorded Data', recordedDataTests.testFramework, 'automated');
        this.registerTestSuite('Load Tests - Extended Operation', loadTests.testFramework, 'load');

        this.overallResults.totalSuites = this.testSuites.size;
        console.log(`📋 Registered ${this.testSuites.size} test suites`);
    }

    async runTestSuitesSequentially() {
        console.log('🔄 Running test suites sequentially...\n');

        for (const [suiteName, suiteConfig] of this.testSuites.entries()) {
            await this.runSingleTestSuite(suiteName, suiteConfig);
        }
    }

    async runTestSuitesInParallel() {
        console.log('⚡ Running test suites in parallel...\n');

        const suitePromises = Array.from(this.testSuites.entries()).map(
            ([suiteName, suiteConfig]) => this.runSingleTestSuite(suiteName, suiteConfig)
        );

        await Promise.allSettled(suitePromises);
    }

    async runSingleTestSuite(suiteName, suiteConfig) {
        console.log(`📦 Starting: ${suiteName}`);
        console.log('─'.repeat(60));

        const suiteStartTime = Date.now();
        const result = {
            name: suiteName,
            category: suiteConfig.category,
            startTime: suiteStartTime,
            endTime: null,
            duration: 0,
            status: 'pending',
            tests: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            },
            errors: [],
            output: []
        };

        try {
            // Capture console output
            const originalLog = console.log;
            const capturedOutput = [];
            console.log = (...args) => {
                capturedOutput.push(args.join(' '));
                originalLog(...args);
            };

            // Set timeout for the suite
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Test suite timeout: ${suiteConfig.timeout}ms`)), suiteConfig.timeout);
            });

            // Run the test suite
            const testPromise = this.runTestFramework(suiteConfig.framework);
            await Promise.race([testPromise, timeoutPromise]);

            // Restore console
            console.log = originalLog;
            result.output = capturedOutput;

            // Extract test results from framework
            result.tests = this.extractTestCounts(suiteConfig.framework);
            result.status = result.tests.failed > 0 ? 'failed' : 'passed';

            if (result.status === 'passed') {
                this.overallResults.passedSuites++;
            } else {
                this.overallResults.failedSuites++;
            }

        } catch (error) {
            result.status = 'failed';
            result.errors.push(error.message);
            this.overallResults.failedSuites++;
            this.overallResults.errors.push(`${suiteName}: ${error.message}`);

            console.error(`❌ ${suiteName} failed:`, error.message);
        } finally {
            result.endTime = Date.now();
            result.duration = result.endTime - result.startTime;

            // Update overall results
            this.overallResults.totalTests += result.tests.total;
            this.overallResults.passedTests += result.tests.passed;
            this.overallResults.failedTests += result.tests.failed;
            this.overallResults.skippedTests += result.tests.skipped;

            this.results.set(suiteName, result);

            const statusIcon = result.status === 'passed' ? '✅' : '❌';
            console.log(`${statusIcon} ${suiteName} completed in ${(result.duration / 1000).toFixed(2)}s`);
            console.log(`   Tests: ${result.tests.passed} passed, ${result.tests.failed} failed, ${result.tests.skipped} skipped\n`);
        }

        return result;
    }

    async runTestFramework(framework) {
        // Create a promise that resolves when the framework completes
        return new Promise((resolve, reject) => {
            // Override the framework's run method to capture completion
            const originalRun = framework.run.bind(framework);

            framework.run = async function() {
                try {
                    await originalRun();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            // Start the tests
            framework.run();
        });
    }

    extractTestCounts(framework) {
        let total = 0, passed = 0, failed = 0, skipped = 0;

        // Count standalone tests
        for (const [testName, result] of framework.results.entries()) {
            total++;
            if (result.status === 'passed') passed++;
            else if (result.status === 'failed') failed++;
            else if (result.status === 'skipped') skipped++;
        }

        // Count suite tests
        for (const [suiteName, suite] of framework.testSuites.entries()) {
            for (const result of suite.results) {
                total++;
                if (result.status === 'passed') passed++;
                else if (result.status === 'failed') failed++;
                else if (result.status === 'skipped') skipped++;
            }
        }

        return { total, passed, failed, skipped };
    }

    async generateReports() {
        console.log('📊 Generating test reports...\n');

        if (TEST_CONFIG.generateJSONReport) {
            await this.generateJSONReport();
        }

        if (TEST_CONFIG.generateHTMLReport) {
            await this.generateHTMLReport();
        }

        console.log('📁 Reports generated in:', TEST_CONFIG.outputDirectory);
    }

    async generateJSONReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: this.overallResults,
            suites: {}
        };

        for (const [suiteName, result] of this.results.entries()) {
            reportData.suites[suiteName] = result;
        }

        const reportPath = path.join(TEST_CONFIG.outputDirectory, 'test-results.json');
        await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
        console.log('   📄 JSON report:', reportPath);
    }

    async generateHTMLReport() {
        const html = this.generateHTMLContent();
        const reportPath = path.join(TEST_CONFIG.outputDirectory, 'test-results.html');
        await fs.writeFile(reportPath, html);
        console.log('   🌐 HTML report:', reportPath);
    }

    generateHTMLContent() {
        const timestamp = new Date().toISOString();
        const successRate = this.overallResults.totalTests > 0 ?
            (this.overallResults.passedTests / this.overallResults.totalTests * 100).toFixed(1) : 0;

        let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Kinect Sound Sculpture - Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #007bff; }
        .summary-card.success { border-left-color: #28a745; }
        .summary-card.failure { border-left-color: #dc3545; }
        .summary-card.warning { border-left-color: #ffc107; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .summary-card.success .value { color: #28a745; }
        .summary-card.failure .value { color: #dc3545; }
        .suite { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 6px; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .suite-header.passed { background: #d4edda; border-bottom-color: #c3e6cb; }
        .suite-header.failed { background: #f8d7da; border-bottom-color: #f5c6cb; }
        .suite-content { padding: 15px; }
        .test-item { padding: 8px; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .status-icon { display: inline-block; width: 20px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #6c757d; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 10px; margin: 10px 0; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Kinect Sound Sculpture - Test Results</h1>
            <p class="timestamp">Generated: ${timestamp}</p>
        </div>

        <div class="summary">
            <div class="summary-card success">
                <h3>Success Rate</h3>
                <div class="value">${successRate}%</div>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.overallResults.totalTests}</div>
            </div>
            <div class="summary-card success">
                <h3>Passed</h3>
                <div class="value">${this.overallResults.passedTests}</div>
            </div>
            <div class="summary-card ${this.overallResults.failedTests > 0 ? 'failure' : ''}">
                <h3>Failed</h3>
                <div class="value">${this.overallResults.failedTests}</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="value">${(this.overallResults.totalDuration / 1000).toFixed(1)}s</div>
            </div>
        </div>`;

        // Add test suites
        for (const [suiteName, result] of this.results.entries()) {
            html += `
        <div class="suite">
            <div class="suite-header ${result.status}">
                <h2>${result.status === 'passed' ? '✅' : '❌'} ${suiteName}</h2>
                <p>Category: ${result.category} | Duration: ${(result.duration / 1000).toFixed(2)}s |
                   Tests: ${result.tests.passed} passed, ${result.tests.failed} failed, ${result.tests.skipped} skipped</p>
            </div>
            <div class="suite-content">`;

            if (result.errors.length > 0) {
                html += `<div class="error"><strong>Errors:</strong><br>${result.errors.join('<br>')}</div>`;
            }

            html += `
            </div>
        </div>`;
        }

        // Add overall errors
        if (this.overallResults.errors.length > 0) {
            html += `
        <div class="suite">
            <div class="suite-header failed">
                <h2>❌ Overall Errors</h2>
            </div>
            <div class="suite-content">
                <div class="error">${this.overallResults.errors.join('<br>')}</div>
            </div>
        </div>`;
        }

        html += `
    </div>
</body>
</html>`;

        return html;
    }

    printFinalSummary() {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 FINAL TEST SUMMARY');
        console.log('═'.repeat(80));

        const successRate = this.overallResults.totalTests > 0 ?
            (this.overallResults.passedTests / this.overallResults.totalTests * 100) : 0;

        console.log(`🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`📦 Test Suites: ${this.overallResults.passedSuites}/${this.overallResults.totalSuites} passed`);
        console.log(`🧪 Individual Tests: ${this.overallResults.passedTests}/${this.overallResults.totalTests} passed`);
        console.log(`⏱️  Total Duration: ${(this.overallResults.totalDuration / 1000).toFixed(1)} seconds`);

        if (this.overallResults.failedTests > 0) {
            console.log(`❌ Failed Tests: ${this.overallResults.failedTests}`);
        }

        if (this.overallResults.errors.length > 0) {
            console.log(`⚠️  Errors: ${this.overallResults.errors.length}`);
        }

        console.log('\n📁 Detailed reports available in:', TEST_CONFIG.outputDirectory);

        if (this.overallResults.failedTests === 0 && this.overallResults.errors.length === 0) {
            console.log('\n🎉 All tests passed! System is ready for deployment.');
        } else {
            console.log('\n⚠️  Some tests failed. Review the reports before deployment.');
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);

    // Parse command line arguments
    const config = { ...TEST_CONFIG };
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--parallel':
                config.parallel = true;
                break;
            case '--no-html':
                config.generateHTMLReport = false;
                break;
            case '--no-json':
                config.generateJSONReport = false;
                break;
            case '--exit-on-failure':
                config.exitOnFailure = true;
                break;
            case '--output':
                config.outputDirectory = args[++i];
                break;
        }
    }

    // Update global config
    Object.assign(TEST_CONFIG, config);

    console.log('🚀 Starting comprehensive test suite...');
    console.log(`⚙️  Configuration: ${config.parallel ? 'parallel' : 'sequential'} execution`);

    const testRunner = new ComprehensiveTestRunner();
    const results = await testRunner.runAllTests();

    // Exit with appropriate code
    const exitCode = (results.failedTests > 0 || results.errors.length > 0) ? 1 : 0;

    if (config.exitOnFailure && exitCode !== 0) {
        process.exit(exitCode);
    }

    return results;
}

// Export for programmatic use
module.exports = { ComprehensiveTestRunner, TEST_CONFIG };

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Test runner crashed:', error);
        process.exit(1);
    });
}