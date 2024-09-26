import {ToolType} from '../enum/toolType';
import {ToolExecutionType} from '../enum/toolExecutionType';

export const PsalmTool = {
    executionType     : ToolExecutionType.STATIC,
    name              : 'Psalm',
    command           : './vendor/bin/psalm --shepherd --stats --output-format=github --no-cache',
    filesToCheck      : [ 'psalm.xml.dist', 'psalm.xml' ],
    toolType          : ToolType.CODE_CHECK,
    lintConfigCommand : 'xmllint --schema vendor/vimeo/psalm/config.xsd',
};
