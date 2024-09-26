import {ToolType} from '../enum/toolType';
import {ToolExecutionType} from '../enum/toolExecutionType';

export const PHPUnitTool = {
    executionType     : ToolExecutionType.MATRIX,
    name              : 'PHPUnit',
    command           : './vendor/bin/phpunit',
    filesToCheck      : [ 'phpunit.xml.dist', 'phpunit.xml' ],
    toolType          : ToolType.CODE_CHECK,
    lintConfigCommand : 'xmllint --schema vendor/phpunit/phpunit/phpunit.xsd',
};
