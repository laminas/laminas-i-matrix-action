import {ToolType} from '../enum/toolType';
import {ToolExecutionType} from '../enum/toolExecutionType';

export const ComposerRequireCheckerTool = {
    executionType : ToolExecutionType.STATIC,
    name          : 'Composer Require Checker',
    command       : './vendor/bin/composer-require-checker check --config-file=composer-require-checker.json -n -v composer.json',
    filesToCheck  : [ 'composer-require-checker.json' ],
    toolType      : ToolType.CODE_CHECK,
};
