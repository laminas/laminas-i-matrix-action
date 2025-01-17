import {ToolExecutionType} from '../enum/toolExecutionType';
import {ToolType} from '../enum/toolType';

export const CodeceptionTool = {
    executionType : ToolExecutionType.STATIC,
    name          : 'Codeception',
    command       : './vendor/bin/codecept run',
    filesToCheck  : [ 'codeception.yml.dist', 'codeception.yml' ],
    toolType      : ToolType.CODE_CHECK,
};
