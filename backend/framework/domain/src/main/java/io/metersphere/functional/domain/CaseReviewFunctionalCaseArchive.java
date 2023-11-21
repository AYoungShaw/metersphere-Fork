package io.metersphere.functional.domain;

import io.metersphere.validation.groups.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import lombok.Data;

@Data
public class CaseReviewFunctionalCaseArchive implements Serializable {
    @Schema(description = "用例评审ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "{case_review_functional_case_archive.review_id.not_blank}", groups = {Created.class})
    @Size(min = 1, max = 50, message = "{case_review_functional_case_archive.review_id.length_range}", groups = {Created.class, Updated.class})
    private String reviewId;

    @Schema(description = "功能用例ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "{case_review_functional_case_archive.case_id.not_blank}", groups = {Created.class})
    @Size(min = 1, max = 50, message = "{case_review_functional_case_archive.case_id.length_range}", groups = {Created.class, Updated.class})
    private String caseId;

    @Schema(description = "功能用例快照（JSON)")
    private String content;

    private static final long serialVersionUID = 1L;

    public enum Column {
        reviewId("review_id", "reviewId", "VARCHAR", false),
        caseId("case_id", "caseId", "VARCHAR", false),
        content("content", "content", "LONGVARCHAR", false);

        private static final String BEGINNING_DELIMITER = "`";

        private static final String ENDING_DELIMITER = "`";

        private final String column;

        private final boolean isColumnNameDelimited;

        private final String javaProperty;

        private final String jdbcType;

        public String value() {
            return this.column;
        }

        public String getValue() {
            return this.column;
        }

        public String getJavaProperty() {
            return this.javaProperty;
        }

        public String getJdbcType() {
            return this.jdbcType;
        }

        Column(String column, String javaProperty, String jdbcType, boolean isColumnNameDelimited) {
            this.column = column;
            this.javaProperty = javaProperty;
            this.jdbcType = jdbcType;
            this.isColumnNameDelimited = isColumnNameDelimited;
        }

        public String desc() {
            return this.getEscapedColumnName() + " DESC";
        }

        public String asc() {
            return this.getEscapedColumnName() + " ASC";
        }

        public static Column[] excludes(Column ... excludes) {
            ArrayList<Column> columns = new ArrayList<>(Arrays.asList(Column.values()));
            if (excludes != null && excludes.length > 0) {
                columns.removeAll(new ArrayList<>(Arrays.asList(excludes)));
            }
            return columns.toArray(new Column[]{});
        }

        public static Column[] all() {
            return Column.values();
        }

        public String getEscapedColumnName() {
            if (this.isColumnNameDelimited) {
                return new StringBuilder().append(BEGINNING_DELIMITER).append(this.column).append(ENDING_DELIMITER).toString();
            } else {
                return this.column;
            }
        }

        public String getAliasedEscapedColumnName() {
            return this.getEscapedColumnName();
        }
    }
}