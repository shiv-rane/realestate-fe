const fs = require('fs');

const content = `package com.realestate.app.controller;

import com.realestate.app.dto.admin.AdminStatsResponse;
import com.realestate.app.dto.admin.CreateDeveloperRequest;
import com.realestate.app.dto.admin.ProjectRequest;
import com.realestate.app.dto.developer.DeveloperProfileResponse;
import com.realestate.app.dto.developer.ProjectResponse;
import com.realestate.app.dto.land.LandParcelResponse;
import com.realestate.app.dto.land.UpdateLandStatusRequest;
import com.realestate.app.entity.enums.LandStatus;
import com.realestate.app.entity.enums.VerificationStatus;
import com.realestate.app.service.AdminService;
import com.realestate.app.service.LandParcelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin Controller — all endpoints require ADMIN role.
 *
 * Developer management:
 *   POST   /api/v1/admin/developers
 *   GET    /api/v1/admin/developers
 *   PUT    /api/v1/admin/developers/{id}
 *   DELETE /api/v1/admin/developers/{id}
 *
 * Project management (scoped under a developer):
 *   POST   /api/v1/admin/developers/{devId}/projects
 *   PUT    /api/v1/admin/developers/{devId}/projects/{projectId}
 *   DELETE /api/v1/admin/developers/{devId}/projects/{projectId}
 *
 * Land Parcel management:
 *   GET    /api/v1/admin/lands
 *   PATCH  /api/v1/admin/lands/{id}/status
 *
 * Stats:
 *   GET /api/v1/admin/stats
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only endpoints — manage developers, projects, lands, and view platform stats")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final LandParcelService landParcelService;

    // -------------------------------------------------------
    // Stats
    // -------------------------------------------------------

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Platform Statistics", description = "Total developer counts by verification status.")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // -------------------------------------------------------
    // Developer CRUD
    // -------------------------------------------------------

    @PostMapping("/developers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Developer", description = "Manually add a developer profile.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Developer created",
            content = @Content(schema = @Schema(implementation = DeveloperProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error",   content = @Content),
        @ApiResponse(responseCode = "409", description = "RERA number already exists", content = @Content)
    })
    public ResponseEntity<DeveloperProfileResponse> createDeveloper(
            @Valid @RequestBody CreateDeveloperRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createDeveloper(request));
    }

    @GetMapping("/developers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List Developers", description = "List all developers. Filter by status via ?status=PENDING|APPROVED|REJECTED.")
    public ResponseEntity<List<DeveloperProfileResponse>> listDevelopers(
            @Parameter(description = "Filter by verification status (optional)")
            @RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminService.listDevelopers(status));
    }

    @PutMapping("/developers/{profileId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Developer", description = "Update developer info and/or verification status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Developer updated",
            content = @Content(schema = @Schema(implementation = DeveloperProfileResponse.class))),
        @ApiResponse(responseCode = "404", description = "Developer not found", content = @Content)
    })
    public ResponseEntity<DeveloperProfileResponse> updateDeveloper(
            @PathVariable UUID profileId,
            @Valid @RequestBody CreateDeveloperRequest request) {
        return ResponseEntity.ok(adminService.updateDeveloper(profileId, request));
    }

    @DeleteMapping("/developers/{profileId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Developer", description = "Delete a developer and all their projects.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Developer deleted"),
        @ApiResponse(responseCode = "404", description = "Developer not found", content = @Content)
    })
    public ResponseEntity<Void> deleteDeveloper(@PathVariable UUID profileId) {
        adminService.deleteDeveloper(profileId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------
    // Project CRUD
    // -------------------------------------------------------

    @PostMapping("/developers/{developerId}/projects")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add Project", description = "Add a project to a developer's portfolio.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Project added",
            content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
        @ApiResponse(responseCode = "404", description = "Developer not found", content = @Content)
    })
    public ResponseEntity<ProjectResponse> addProject(
            @PathVariable UUID developerId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addProject(developerId, request));
    }

    @PutMapping("/developers/{developerId}/projects/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Project", description = "Update a project's details.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project updated",
            content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
        @ApiResponse(responseCode = "404", description = "Project or developer not found", content = @Content)
    })
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID developerId,
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(adminService.updateProject(developerId, projectId, request));
    }

    @DeleteMapping("/developers/{developerId}/projects/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Project", description = "Remove a project from a developer's portfolio.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Project deleted"),
        @ApiResponse(responseCode = "404", description = "Project or developer not found", content = @Content)
    })
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID developerId,
            @PathVariable UUID projectId) {
        adminService.deleteProject(developerId, projectId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------
    // Land Parcel Management (Admin Oversight)
    // -------------------------------------------------------

    @GetMapping("/lands")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Admin: List All Land Parcels",
        description = "List all land parcels submitted across the platform by all users. Filter by ?status=PENDING_REVIEW|VERIFIED|IN_DISCUSSION|REJECTED."
    )
    public ResponseEntity<List<LandParcelResponse>> listAllLands(
            @Parameter(description = "Filter by land parcel status (optional)")
            @RequestParam(required = false) LandStatus status) {
        return ResponseEntity.ok(landParcelService.listAllParcelsForAdmin(status));
    }

    @PatchMapping("/lands/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Admin: Update Land Status",
        description = "Verifies, approves, or rejects a submitted land parcel with admin feedback."
    )
    public ResponseEntity<LandParcelResponse> updateLandStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLandStatusRequest request) {
        return ResponseEntity.ok(landParcelService.updateParcelStatusByAdmin(id, request));
    }
}
`;

fs.writeFileSync('D:/Projects/app/src/main/java/com/realestate/app/controller/AdminController.java', content, 'utf8');
console.log('Successfully updated AdminController.java with GET /api/v1/admin/lands and PATCH /api/v1/admin/lands/{id}/status');
