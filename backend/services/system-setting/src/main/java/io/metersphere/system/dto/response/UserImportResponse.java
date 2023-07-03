package io.metersphere.system.dto.response;

import io.metersphere.sdk.dto.ExcelParseDTO;
import io.metersphere.system.dto.excel.UserExcelRowDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.collections4.MapUtils;

import java.util.TreeMap;

@Getter
@Setter
public class UserImportResponse {
    @Schema(title = "导入数量")
    private int importCount;
    @Schema(title = "成功数量")
    private int successCount;
    @Schema(title = "报错信息")
    private TreeMap<Integer, String> errorMessages = new TreeMap<>();

    public void generateResponse(ExcelParseDTO<UserExcelRowDTO> excelParseDTO) {
        successCount = excelParseDTO.getDataList().size();
        if (MapUtils.isNotEmpty(excelParseDTO.getErrRowData())) {
            excelParseDTO.getErrRowData().forEach((k, v) -> {
                errorMessages.put(k, v.getErrorMessage());
            });
        }
        importCount = errorMessages.size() + successCount;
    }
}
