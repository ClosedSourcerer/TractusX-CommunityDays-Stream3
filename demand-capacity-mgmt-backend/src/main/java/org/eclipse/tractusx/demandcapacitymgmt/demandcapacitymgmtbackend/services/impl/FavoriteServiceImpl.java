/*
 * ******************************************************************************
 * Copyright (c) 2023 BMW AG
 * Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * *******************************************************************************
 */

package org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.services.impl;

import eclipse.tractusx.demand_capacity_mgmt_specification.model.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.entities.*;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.entities.enums.FavoriteType;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.repositories.*;
import org.eclipse.tractusx.demandcapacitymgmt.demandcapacitymgmtbackend.services.FavoriteService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;

    private final CapacityGroupRepository capacityGroupRepository;
    private final MaterialDemandRepository materialDemandRepository;
    private final CompanyRepository companyRepository;

    private final LoggingHistoryRepository eventRepository;

    @Override
    public FavoriteResponse getAllFavorites(String userID) {
        List<FavoriteEntity> favoriteEntities = favoriteRepository.findByUserID(UUID.fromString(userID));
        return filterFavorites(favoriteEntities);
    }

    @Override
    public FavoriteResponse getAllFavoritesByType(String userID, FavoriteType type) {
        List<FavoriteEntity> favoriteResponseList = favoriteRepository.findByUserIDAndType(
            UUID.fromString(userID),
            type
        );
        switch (type) {
            case CAPACITY_GROUP -> {
                List<SingleCapacityGroupFavoriteResponse> favoriteResponses = new ArrayList<>();
                for (FavoriteEntity fav : favoriteResponseList) {
                    favoriteResponses.add(convertToSingleCapacityGroup(fav));
                }
                FavoriteResponse response = new FavoriteResponse();
                response.setCapacityGroups(favoriteResponses);
                return response;
            }
            case MATERIAL_DEMAND -> {
                List<MaterialDemandFavoriteResponse> favoriteResponses = new ArrayList<>();
                for (FavoriteEntity fav : favoriteResponseList) {
                    favoriteResponses.add(convertToMaterialDemandResponse(fav));
                }
                FavoriteResponse response = new FavoriteResponse();
                response.setMaterialDemands(favoriteResponses);
                return response;
            }
            case COMPANY_BASE_DATA -> {
                List<CompanyDtoFavoriteResponse> favoriteResponses = new ArrayList<>();
                for (FavoriteEntity fav : favoriteResponseList) {
                    favoriteResponses.add(convertToCompanyDto(fav));
                }
                FavoriteResponse response = new FavoriteResponse();
                response.setCompanies(favoriteResponses);
                return response;
            }
            case EVENT -> {
                List<EventFavoriteResponse> favoriteResponses = new ArrayList<>();
                for (FavoriteEntity fav : favoriteResponseList) {
                    favoriteResponses.add(convertToEventDto(fav));
                }
                FavoriteResponse response = new FavoriteResponse();
                response.setEvents(favoriteResponses);
                return response;
            }
        }
        return new FavoriteResponse();
    }

    private FavoriteResponse filterFavorites(List<FavoriteEntity> favoriteEntities) {
        FavoriteResponse response = new FavoriteResponse();

        List<SingleCapacityGroupFavoriteResponse> capacityGroupList = new ArrayList<>();
        List<MaterialDemandFavoriteResponse> materialDemandList = new ArrayList<>();
        List<CompanyDtoFavoriteResponse> companyList = new ArrayList<>();
        List<EventFavoriteResponse> eventsList = new ArrayList<>();

        for (FavoriteEntity entity : favoriteEntities) {
            switch (entity.getType()) {
                case CAPACITY_GROUP -> capacityGroupList.add(convertToSingleCapacityGroup(entity));
                case MATERIAL_DEMAND -> materialDemandList.add(convertToMaterialDemandResponse(entity));
                case COMPANY_BASE_DATA -> companyList.add(convertToCompanyDto(entity));
                case EVENT -> eventsList.add(convertToEventDto(entity));
            }
        }

        // Set the filtered lists to the response
        response.setCapacityGroups(capacityGroupList);
        response.setMaterialDemands(materialDemandList);
        response.setCompanies(companyList);
        response.setEvents(eventsList);

        return response;
    }

    private SingleCapacityGroupFavoriteResponse convertToSingleCapacityGroup(FavoriteEntity entity) {
        Optional<CapacityGroupEntity> cgEntity = capacityGroupRepository.findById(entity.getFavoriteId());
        if (cgEntity.isPresent()) {
            CapacityGroupEntity capacityGroup = cgEntity.get();
            SingleCapacityGroupFavoriteResponse scgfv = new SingleCapacityGroupFavoriteResponse();
            scgfv.setId(capacityGroup.getId().toString());
            scgfv.setCapacityGroupId(capacityGroup.getId().toString());
            scgfv.setCapacityGroupName(capacityGroup.getCapacityGroupName());
            scgfv.setCustomer(capacityGroup.getCustomer().getBpn());
            scgfv.setSupplier(capacityGroup.getSupplier().getBpn());
            scgfv.setFavoritedAt(entity.getFavorited_at().toString());
            return scgfv;
        } else return null;
    }

    private MaterialDemandFavoriteResponse convertToMaterialDemandResponse(FavoriteEntity entity) {
        Optional<MaterialDemandEntity> materialDemandEntity = materialDemandRepository.findById(entity.getFavoriteId());
        if (materialDemandEntity.isPresent()) {
            MaterialDemandEntity materialDemand = materialDemandEntity.get();

            MaterialDemandFavoriteResponse response = new MaterialDemandFavoriteResponse();
            response.setId(materialDemand.getId().toString());
            CompanyEntity cEntity = materialDemand.getCustomerId();
            CompanyEntity sEntity = materialDemand.getSupplierId();
            response.setCustomer(cEntity.getId().toString());
            response.setSupplier(sEntity.getId().toString());
            response.setMaterialNumberCustomer(materialDemand.getMaterialNumberCustomer());
            response.setMaterialNumberSupplier(materialDemand.getMaterialNumberSupplier());
            response.setChangedAt(materialDemand.getChangedAt().toString());
            response.setUnitOfMeasure(materialDemand.getUnitMeasure().getCxSymbol());
            response.setFavoritedAt(entity.getFavorited_at().toString());

            return response;
        } else return null;
    }

    private CompanyDtoFavoriteResponse convertToCompanyDto(FavoriteEntity entity) {
        Optional<CompanyEntity> cEntity = companyRepository.findById(entity.getFavoriteId());
        if (cEntity.isPresent()) {
            CompanyEntity companyEntity = cEntity.get();

            CompanyDtoFavoriteResponse companyFavoriteResponse = new CompanyDtoFavoriteResponse();
            companyFavoriteResponse.setId(companyEntity.getId().toString());
            companyFavoriteResponse.setBpn(companyEntity.getBpn());
            companyFavoriteResponse.setMyCompany(companyEntity.getMyCompany());
            companyFavoriteResponse.setCompanyName(companyEntity.getCompanyName());
            companyFavoriteResponse.setCountry(companyEntity.getCountry());
            companyFavoriteResponse.setZipCode(companyEntity.getZipCode());
            companyFavoriteResponse.setFavoritedAt(entity.getFavorited_at().toString());
            return companyFavoriteResponse;
        } else return null;
    }

    private EventFavoriteResponse convertToEventDto(FavoriteEntity entity) {
        LoggingHistoryEntity eEntity = eventRepository.findByLogID(entity.getFavoriteId());
        EventFavoriteResponse eventEntity = new EventFavoriteResponse();
        eventEntity.setEventType(eEntity.getEventType().toString());
        eventEntity.setDescription(eEntity.getDescription());
        eventEntity.setUserAccount(eEntity.getUserAccount());
        eventEntity.setId(String.valueOf(eEntity.getId()));
        eventEntity.setLogID(eEntity.getLogID().toString());
        eventEntity.setTimeCreated(eEntity.getTime_created().toString());
        eventEntity.setFavoritedAt(entity.getFavorited_at().toString());
        return eventEntity;
    }

    @Override
    public void createFavorite(FavoriteRequest favoriteRequest, String cookieUserID) {
        favoriteRepository.save(generateFavoriteEntity(favoriteRequest, cookieUserID));
    }

    @Override
    public void deleteFavorite(String userID, String favoriteID) {
        favoriteRepository.deleteFavorite(UUID.fromString(userID), UUID.fromString(favoriteID));
    }

    private FavoriteEntity generateFavoriteEntity(FavoriteRequest request, String cookieUserID) {
        return FavoriteEntity
            .builder()
            .userID(UUID.fromString(cookieUserID))
            .favorited_at(Timestamp.from(Instant.now()))
            .favoriteId(UUID.fromString(request.getFavoriteId()))
            .type(FavoriteType.valueOf(request.getfType()))
            .build();
    }
}
