import core from '@actions/core';
import fs from 'fs';
import { Check } from './check.js';
import { Command } from './command.js';
import { Config } from './config.js';
import { Job } from './job.js';
import create_additional_jobs from './additional-checks.js';
import validateAndNormalizeChecks from './validate-and-normalize-checks-from-config.js';

const xmlSchema = {
    phpunit: 'vendor/phpunit/phpunit/phpunit.xsd',
    phpcs: 'vendor/squizlabs/php_codesniffer/phpcs.xsd',
    psalm: 'vendor/vimeo/psalm/config.xsd',
};

/**
 * @param {String} filename
 * @return {function(): boolean}
 */
const fileTest = function (filename) {
    return function () {
        return fs.existsSync(filename);

    };
};

/**
 * @param {String} command
 * @param {Config} config
 * @return {Array}
 */
const createQaJobs = function (command, config) {
    return [new Job(
        command + ' on PHP ' + config.minimum_version,
        JSON.stringify(new Command(
            command,
            config.minimum_version,
            config.extensions,
            config.php_ini,
            'locked',
            config.ignore_platform_reqs_8,
        ))
    )];
};

/**
 * @param {String} command
 * @param {Config} config
 * @return {Array}
 */
const createPHPUnitJobs = function (command, config) {
    let jobs = [];
    if (config.lockedDependencies) {
        /** Locked dependencies are always used with the minimum PHP version supported by the project. */
        jobs.push(createPHPUnitJob(config.minimum_version, 'locked', config));
    }

    config.versions.forEach(
        /**
         * @param {String} version
         */
        function (version) {
            config.dependencies.forEach(
                /**
                 * @param {String} deps
                 */
                function (deps) {
                    jobs.push(createPHPUnitJob(command, version, deps, config));
                }
            );
        }
    );

    return jobs;
};

/**
 * @param {String} command
 * @param {String} version
 * @param {String} deps
 * @param {Config} config
 * @return {Job}
 */
const createPHPUnitJob = function (command, version, deps, config) {
    return new Job(
        'PHPUnit on PHP ' + version + ' with ' + deps + ' dependencies',
        JSON.stringify(new Command(
            command,
            version,
            config.extensions,
            config.php_ini,
            deps,
            config.ignore_platform_reqs_8,
        ))
    );
};

/**
 * @param {Config} config
 * @return {Array}
 */
const createNoOpJob = function (config) {
    return [new Job(
        'No checks',
        JSON.stringify(new Command(
            '',
            config.stable_version,
            [],
            [],
            'locked',
            config.ignore_platform_reqs_8,
        ))
    )];
};

/**
 * @param {Config} config
 * @return {Array}
 */
function checks (config) {
    return [
        new Check(
            config.code_checks,
            [fileTest('phpunit.xml.dist')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createPHPUnitJobs(
                    `xmllint --noout --schema ${xmlSchema.phpunit} phpunit.xml.dist`
                    + './vendor/bin/phpunit',
                    config,
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('phpunit.xml')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createPHPUnitJobs(
                    `xmllint --noout --schema ${xmlSchema.phpunit} phpunit.xml`
                    + './vendor/bin/phpunit',
                    config,
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('phpcs.xml.dist')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs(
                    `xmllint --noout --schema ${xmlSchema.phpcs} phpcs.xml.dist`
                    + './vendor/bin/phpcs -q --report=checkstyle | cs2pr',
                    config
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('phpcs.xml')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs(
                    `xmllint --noout --schema ${xmlSchema.phpcs} phpcs.xml`
                    + './vendor/bin/phpcs -q --report=checkstyle | cs2pr',
                    config
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('psalm.xml.dist')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs(
                    `xmllint --noout --schema ${xmlSchema.psalm} psalm.xml.dist`
                    + './vendor/bin/psalm --shepherd --stats --output-format=github --no-cache',
                    config
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('psalm.xml')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs(
                    `xmllint --noout --schema ${xmlSchema.psalm} psalm.xml`
                    + './vendor/bin/psalm --shepherd --stats --output-format=github --no-cache',
                    config
                );
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('phpbench.json')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs(
                    './vendor/bin/phpbench run --revs=2 --iterations=2 --report=aggregate',
                    config
                );
            }
        ),
        new Check(
            config.doc_linting,
            [fileTest('mkdocs.yml')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs('yamllint -d relaxed --no-warnings mkdocs.yml', config);
            }
        ),
        new Check(
            config.doc_linting,
            [fileTest('doc/book/')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs('markdownlint doc/book/**/*.md', config);
            }
        ),
        new Check(
            config.doc_linting,
            [fileTest('docs/book/')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs('markdownlint docs/book/**/*.md', config);
            }
        ),
        new Check(
            config.code_checks,
            [fileTest('codeception.yml.dist'), fileTest('codeception.yml')],
            /**
             * @param {Config} config
             * @return {Array}
             */
            function (config) {
                return createQaJobs('vendor/bin/codecept run', config);
            }
        )
    ];
}

const excludeJob = function (job, exclusion) {
    let matches = 0;
    Object.keys(job).forEach(function (jobKey) {
        Object.keys(exclusion).forEach(function (excludeKey) {
            if (excludeKey !== jobKey) {
                return;
            }

            if (job[jobKey] === exclusion[excludeKey]) {
                matches += 1;
            }
        });
    });
    return Object.keys(exclusion).length === matches;
};

/**
 * @param {Config} config
 * @return {Array}
 */
export default function (config) {
    if (config.checks.length) {
        core.info('Using checks found in configuration');
        return validateAndNormalizeChecks(config.checks);
    }

    /** @var {Array} jobs */
    let jobs = checks(config)
        .reduce(function (jobs, check) {
            return jobs.concat(check.jobs(config));
        }, [])
        .concat(create_additional_jobs(config))
        .filter(function (job) {
            let keep = true;
            config.exclude.forEach(function (exclusion) {
                keep = keep && ! excludeJob(job, exclusion);
            });

            if (! keep) {
                console.log('Excluding job', job.toJSON());
            }

            return keep;
        });

    return jobs.length ? jobs : createNoOpJob(config);
};
