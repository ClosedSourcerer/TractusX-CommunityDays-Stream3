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

import React, { createContext, useEffect, useState } from 'react';
import { EventProp } from '../interfaces/event_interfaces';
import createAPIInstance from "../util/Api";
import { useUser } from './UserContext';

interface EventsContextData {
  events: EventProp[];
  archiveEvents: EventProp[];
  fetchEvents: () => Promise<void>;
  fetchFilteredEvents: (filters: {
    start_time?: string;
    end_time?: string;
    event?: string;
    material_demand_id?: string;
    capacity_group_id?: string;
  }) => Promise<EventProp[]>;
  archiveLog: (event: EventProp) => Promise<void>;
  deleteAllEvents: () => Promise<void>;
  deleteAllArchivedLogs: () => Promise<void>;
}


export const EventsContext = createContext<EventsContextData | undefined>(undefined);

const EventsContextProvider: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const { accessToken } = useUser();
  const [events, setEvents] = useState<EventProp[]>([]);
  const [archiveEvents, setArchiveEvents] = useState<EventProp[]>([]);

  const fetchEvents = async () => {
    try {
      const api = createAPIInstance(accessToken);
      const response = await api.get('/loggingHistory');
      const result: EventProp[] = response.data;
      setEvents(result);
    } catch (error) {
      console.error('Error fetching event history:', error);
    }
  };

  const fetchArchiveEvents = async () => {
    try {
      const api = createAPIInstance(accessToken);
      const response = await api.get('/loggingHistory/archivedLog');
      const result: EventProp[] = response.data;
      setArchiveEvents(result); // Set archiveEvents, not events
    } catch (error) {
      console.error('Error fetching archived event history:', error);
    }
  };


  useEffect(() => {
    fetchEvents();
    fetchArchiveEvents();
  }, [accessToken]);

  const fetchFilteredEvents = async (filters: {
    start_time?: string;
    end_time?: string;
    event?: string;
    material_demand_id?: string;
    capacity_group_id?: string;
  }): Promise<EventProp[]> => {
    try {
      const api = createAPIInstance(accessToken);
      const response = await api.get('/loggingHistory/filterLogs', { params: filters });
      const result: EventProp[] = response.data;
      return result; // Return the array of events
    } catch (error) {
      console.error('Error fetching event history:', error);
      throw error; // Throw the error to handle it in the calling code if necessary
    }
  };


  const archiveLog = async (event: EventProp) => {
    try {
      console.log(event)
      const api = createAPIInstance(accessToken);
      await api.post('/loggingHistory/archivedLog', event);
    } catch (error) {
      console.error('Error archiving event:', error);
      throw error;
    }
  };

  const deleteAllEvents = async () => {
    try {
      const api = createAPIInstance(accessToken);
      await api.delete(`/loggingHistory`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting demand:', error);
    }
  };

  const deleteAllArchivedLogs = async () => {
    try {
      const api = createAPIInstance(accessToken);
      await api.delete(`/loggingHistory/archivedLog`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting demand:', error);
    }
  };

  return (
    <EventsContext.Provider value={{ events, archiveEvents, fetchEvents, fetchFilteredEvents, archiveLog, deleteAllEvents, deleteAllArchivedLogs }}>
      {props.children}
    </EventsContext.Provider>
  );
};

export default EventsContextProvider;
