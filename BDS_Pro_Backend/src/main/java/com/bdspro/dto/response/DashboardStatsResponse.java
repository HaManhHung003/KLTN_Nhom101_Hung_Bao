package com.bdspro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalProperties;
    private long activeProperties;
    private long pendingProperties;
    private long totalTransactions;
    private BigDecimal revenue;
}
