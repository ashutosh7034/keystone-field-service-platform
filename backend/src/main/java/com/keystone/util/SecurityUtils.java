package com.keystone.util;

import com.keystone.domain.Role;
import com.keystone.exception.UnauthorizedAccessException;
import com.keystone.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static UserPrincipal getRequiredCurrentUserPrincipal() {
        return getCurrentUserPrincipal()
                .orElseThrow(() -> new UnauthorizedAccessException("Authentication required to perform this action."));
    }

    public static Long getCurrentUserId() {
        return getRequiredCurrentUserPrincipal().getId();
    }

    public static Role getCurrentUserRole() {
        return getRequiredCurrentUserPrincipal().getRole();
    }

    public static boolean isManager() {
        return getCurrentUserRole() == Role.ROLE_MANAGER;
    }

    public static boolean isDispatcher() {
        return getCurrentUserRole() == Role.ROLE_DISPATCHER;
    }

    public static boolean isTechnician() {
        return getCurrentUserRole() == Role.ROLE_TECHNICIAN;
    }

    public static boolean isCustomer() {
        return getCurrentUserRole() == Role.ROLE_CUSTOMER;
    }

    public static Long getRequiredCustomerId() {
        UserPrincipal principal = getRequiredCurrentUserPrincipal();
        if (principal.getCustomerId() == null) {
            throw new UnauthorizedAccessException("Current user is not associated with any customer account.");
        }
        return principal.getCustomerId();
    }
}
