import {ToolType} from '../enum/toolType';
import {ToolExecutionType} from '../enum/toolExecutionType';

export const PhpBenchTool = {
    executionType : ToolExecutionType.STATIC,
    name          : 'PHPBench',
    command       : './vendor/bin/phpbench run --revs=2 --iterations=2 --report=aggregate',
    filesToCheck  : [ 'phpbench.json' ],
    toolType      : ToolType.CODE_CHECK,
};
