import {PathLike} from 'fs';
import {configDotenv} from 'dotenv';
import createConfig, {gatherVersions} from './app';

beforeEach(() => {
    jest.resetModules();

    // Clean enviroment to avoid side-effects
    process.env = {};
});

describe('config/app', () => {
    describe('gatherVersions()', () => {
        test.each`
            constraint                     | expected
            ${'7.0'}                       | ${[ ]}
            ${'^7.0'}                      | ${[ ]}
            ${'8.1'}                       | ${[ '8.1' ]}
            ${'8.1.0'}                     | ${[ '8.1' ]}
            ${'8.1.12'}                    | ${[ '8.1' ]}
            ${'^8.1'}                      | ${[ '8.1', '8.2', '8.3', '8.4' ]}
            ${'^8.1.0'}                    | ${[ '8.1', '8.2', '8.3', '8.4' ]}
            ${'^8.1.12'}                   | ${[ '8.1', '8.2', '8.3', '8.4' ]}
            ${'~8.1'}                      | ${[ '8.1' ]}
            ${'~8.1.0'}                    | ${[ '8.1' ]}
            ${'~8.1.12'}                   | ${[ '8.1' ]}
            ${'^8.0 || ~8.0.0 || ~8.1.12'} | ${[ '8.0', '8.1', '8.2', '8.3', '8.4' ]}
            ${'<=8.1.0'}                   | ${[ '8.0', '8.1' ]}
        `('for "$constraint" === $expected', ({constraint, expected}) => {
            expect(gatherVersions({require: {php: constraint}})).toEqual(expected);
        });
    });

    describe('createConfig()', () => {
        const phpIniFromConfigurationPath: PathLike = 'tests/php-ini-from-configuration';
        const roaveBackwardCompatibilityPath: PathLike = 'tests/code-check-roave-backward-compatibility';

        it('should return valid config', () => {
            expect(createConfig(
                {
                    codeChecks : true,
                    docLinting : true,
                },
                `${phpIniFromConfigurationPath}/composer.json`,
                `${phpIniFromConfigurationPath}/composer.lock`,
                `${phpIniFromConfigurationPath}/.laminas-ci.json`
            )).toEqual({
                codeChecks                    : true,
                docLinting                    : true,
                versions                      : [ '8.1' ],
                stablePhpVersion              : '8.1',
                minimumPhpVersion             : '8.1',
                latestPhpVersion              : '8.1',
                lockedDependenciesExists      : false,
                phpExtensions                 : [ 'mbstring', 'json' ],
                phpIni                        : [ 'error_reporting=E_ALL' ],
                ignorePhpPlatformRequirements : {},
                additionalComposerArguments   : [],
                backwardCompatibilityCheck    : false,
                baseReference                 : null,
            });
        });

        it('should detect GITHUB_BASE_REF', () => {
            const environment = process.env;

            configDotenv({path: `${roaveBackwardCompatibilityPath}/test.env`});

            expect(createConfig(
                {
                    codeChecks : true,
                    docLinting : true,
                },
                `${roaveBackwardCompatibilityPath}/composer.json`,
                `${roaveBackwardCompatibilityPath}/composer.lock`,
                `${roaveBackwardCompatibilityPath}/.laminas-ci.json`
            )).toEqual({
                codeChecks                    : true,
                docLinting                    : true,
                versions                      : [],
                stablePhpVersion              : '8.0',
                minimumPhpVersion             : '8.0',
                latestPhpVersion              : '8.0',
                lockedDependenciesExists      : false,
                phpExtensions                 : [],
                phpIni                        : [],
                ignorePhpPlatformRequirements : {},
                additionalComposerArguments   : [],
                backwardCompatibilityCheck    : true,
                baseReference                 : '1111222233334444aaaabbbbccccdddd',
            });

            process.env = environment;
        });
    });
});
