# *******************************************************************************
# Copyright (c) 2023 BMW AG
# Copyright (c) 2023 Contributors to the Eclipse Foundation
#
#   See the NOTICE file(s) distributed with this work for additional
#   information regarding copyright ownership.
#
#   This program and the accompanying materials are made available under the
#   terms of the Apache License, Version 2.0 which is available at
#   https://www.apache.org/licenses/LICENSE-2.0.
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#   WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#   License for the specific language governing permissions and limitations
#   under the License.
#
#   SPDX-License-Identifier: Apache-2.0
#   ********************************************************************************


FROM maven:3.8.7-eclipse-temurin-17 as build

RUN mkdir /app
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src/ /app/src/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

RUN mkdir /opt/app
COPY --from=build /app/target/*.jar /opt/app/demand-capacity-mgmt-backend.jar

ENTRYPOINT ["sh", "-c", " java ${JAVA_OPTS} -jar /opt/app/demand-capacity-mgmt-backend.jar ${0} ${@}"]



