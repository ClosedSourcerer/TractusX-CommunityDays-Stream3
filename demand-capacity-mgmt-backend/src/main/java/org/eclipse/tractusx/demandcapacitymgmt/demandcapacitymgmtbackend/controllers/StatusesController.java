/*
 *  *******************************************************************************
 *  Copyright (c) 2023 BMW AG
 *  Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 *    See the NOTICE file(s) distributed with this work for additional
 *    information regarding copyright ownership.
 *
 *    This program and the accompanying materials are made available under the
 *    terms of the Apache License, Version 2.0 which is available at
 *    https://www.apache.org/licenses/LICENSE-2.0.
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *    License for the specific language governing permissions and limitations
 *    under the License.
 *
 *    SPDX-License-Identifier: Apache-2.0
 *    ********************************************************************************
 */

package org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.controllers;

import eclipse.tractusx.demand_capacity_mgmt_specification.api.StatusesApi;
import eclipse.tractusx.demand_capacity_mgmt_specification.model.StatusRequest;
import eclipse.tractusx.demand_capacity_mgmt_specification.model.StatusesResponse;
import java.util.List;
import lombok.AllArgsConstructor;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.services.DemandService;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.services.StatusesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class StatusesController implements StatusesApi {

    private final StatusesService statusesService;

    @Override
    public ResponseEntity<StatusesResponse> getStatuses() {
        return ResponseEntity.status(HttpStatus.OK).body(statusesService.getAllStatuses());
    }

    @Override
    public ResponseEntity<StatusesResponse> postStatus(StatusRequest statusRequest) {
        StatusesResponse responseDto = statusesService.postStatuses(statusRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @Override
    public ResponseEntity<StatusesResponse> updateStatusesById(String statusId, StatusRequest statusRequest) {
        return null;
    }
}
