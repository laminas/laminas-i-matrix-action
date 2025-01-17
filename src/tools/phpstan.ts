import {ToolType} from '../enum/toolType';
import {ToolExecutionType} from '../enum/toolExecutionType';

export const PHPStanTool = {
    executionType : ToolExecutionType.STATIC,
    name          : 'PHPStan',
    command       : './vendor/bin/phpstan analyse --error-format=github --ansi --no-progress',
    filesToCheck  : [ 'phpstan.neon', 'phpstan.neon.dist', 'phpstan.dist.neon' ],
    toolType      : ToolType.CODE_CHECK,
};
