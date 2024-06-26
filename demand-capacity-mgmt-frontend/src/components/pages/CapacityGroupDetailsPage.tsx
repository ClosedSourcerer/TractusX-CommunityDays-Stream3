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
import { useContext, useEffect, useMemo, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CapacityGroupChronogram from '../../components/capacitygroup/CapacityGroupChronogram';
import { CapacityGroupContext } from '../../contexts/CapacityGroupsContextProvider';
import DemandContextProvider, { DemandContext } from '../../contexts/DemandContextProvider';
import { EventsContext } from '../../contexts/EventsContextProvider';
import { SingleCapacityGroup } from '../../interfaces/capacitygroup_interfaces';
import { DemandProp } from "../../interfaces/demand_interfaces";
import { EventProp } from '../../interfaces/event_interfaces';
import { defaultEndDateString, defaultStartDateString } from '../../util/Defaults';
import ContactsBoardView from '../addessBook/BoardView';
import CapacityGroupBottlenecks from '../capacitygroup/CapacityGroupBottlenecks';
import CapacityGroupDemandsList from '../capacitygroup/CapacityGroupDemandsList';
import CapacityGroupSumView from '../capacitygroup/CapacityGroupSumView';
import { LoadingMessage } from '../common/LoadingMessages';
import EventsTable from '../events/EventsTable';

function CapacityGroupDetailsPage() {
    const { id } = useParams();
    const context = useContext(CapacityGroupContext);

    if (!context) {
        throw new Error('CapacityGroupDetailsPage must be used within a CapacityGroupsProvider');
    }

    const { getCapacityGroupById } = context;
    const [activeTab, setActiveTab] = useState('overview');
    const [capacityGroup, setCapacityGroup] = useState<SingleCapacityGroup | null | undefined>(null);
    const [materialDemands, setMaterialDemands] = useState<DemandProp[] | null>([]);
    const [companyids, setCompanyIds] = useState<string[]>([]); // State to store company IDs
    const { fetchFilteredEvents } = useContext(EventsContext)!;
    const { getDemandbyId } = useContext(DemandContext)!;
    const [capacityGroupEvents, setcapacityGroupEvents] = useState<EventProp[]>([]);
    const navigate = useNavigate()



    const [startDate, setStartDate] = useState<Date>(new Date(defaultStartDateString));
    const [endDate, setEndDate] = useState<Date>(new Date(defaultEndDateString));


    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const fetchedCapacityGroup = await getCapacityGroupById(id);
                    if (!fetchedCapacityGroup) {

                        navigate('/invalid');
                        return;
                    }
                    setCapacityGroup(fetchedCapacityGroup || null);

                    // Fetching material demands for the capacity group
                    if (fetchedCapacityGroup.linkMaterialDemandIds && fetchedCapacityGroup.linkMaterialDemandIds.length > 0) {
                        const demandPromises = fetchedCapacityGroup.linkMaterialDemandIds.map(demandId => getDemandbyId(demandId));
                        const demands = await Promise.all(demandPromises);

                        // Extract supplier from fetchedCapacityGroup
                        const supplierId = fetchedCapacityGroup.supplier?.id || '';

                        // Extract customer IDs from demands
                        const customerIds = demands.map(demand => demand?.customer.id);

                        // Filter out any potential undefined values before setting the state.
                        const validDemands = demands.filter(Boolean) as DemandProp[];
                        const allCompanyIds = [supplierId, ...customerIds].filter(Boolean) as string[];
                        setCompanyIds(allCompanyIds);
                        setMaterialDemands(validDemands);
                    }

                    const filters = {
                        capacity_group_id: id,
                        start_time: '',
                        end_time: '',
                        event: '',
                        material_demand_id: '',
                    };
                    setcapacityGroupEvents(await fetchFilteredEvents(filters));
                } catch (error) {
                    console.error('Failed to fetch capacity group:', error);
                    navigate('/error');
                }
            })();
        }
    }, [id, getCapacityGroupById, navigate, getDemandbyId]); // eslint-disable-line react-hooks/exhaustive-deps

    function updateParentDateRange(start: Date, end: Date) {
        setStartDate(start);
        setEndDate(end);
    }

    const memoizedComponent = useMemo(() => {
        if (!capacityGroup) {
            return <LoadingMessage />;
        }

        return (
            <>
                <div className="container-xl">
                    <br />
                    <div className="row">
                        <div className="col"></div>
                        <div className="col-6 border d-flex align-items-center justify-content-center" style={{ padding: '10px' }}>
                            {capacityGroup?.capacityGroupId} - {capacityGroup?.capacityGroupName}
                        </div>
                        <div className="col d-flex justify-content-end">
                        </div>
                    </div>
                    <Tabs
                        defaultActiveKey="overview"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                        activeKey={activeTab}
                        onSelect={(tabKey) => {
                            if (typeof tabKey === 'string') {
                                setActiveTab(tabKey);
                            }
                        }}
                    >
                        <Tab eventKey="overview" title="Overview">
                            <CapacityGroupSumView
                                capacityGroup={capacityGroup}
                                materialDemands={materialDemands}
                                updateParentDateRange={updateParentDateRange}
                            />
                            <div id='chart-container'>
                                <CapacityGroupChronogram
                                    capacityGroup={capacityGroup}
                                    materialDemands={materialDemands}
                                    startDate={startDate}
                                    endDate={endDate} />
                            </div>
                        </Tab>
                        <Tab eventKey="materials" title="Materials">
                            <DemandContextProvider>
                                <CapacityGroupDemandsList capacityGroupDemands={capacityGroup?.linkMaterialDemandIds} capacityGroupId={capacityGroup?.capacityGroupId} />
                            </DemandContextProvider>
                        </Tab>
                        <Tab eventKey="events" title="Events">
                            <EventsTable events={capacityGroupEvents} isArchive={false} />
                        </Tab>
                        <Tab eventKey="contacts" title="Contacts">
                            <ContactsBoardView companyids={companyids} isModal={true} />
                        </Tab>
                        {capacityGroup.ruled ? (
                            <Tab eventKey="bottlenecks" title="Bottlenecks">
                                <CapacityGroupBottlenecks
                                    capacityGroupID={capacityGroup.capacityGroupId}
                                    startDate={startDate.toISOString().split('T')[0]}
                                    endDate={endDate.toISOString().split('T')[0]}
                                />
                            </Tab>
                        ) : null}
                    </Tabs>
                </div>
            </>
        );
    }, [capacityGroup, capacityGroupEvents, materialDemands, companyids, activeTab, startDate, endDate]);

    return memoizedComponent;
}

export default CapacityGroupDetailsPage;
