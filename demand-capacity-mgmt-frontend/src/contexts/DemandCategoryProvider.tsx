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

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from "../util/Api";

export interface DemandCategory {
  id: string
  demandCategoryCode: string
  demandCategoryName: string
}

interface DemandContextData {
  demandcategories: DemandCategory[];
}

export const DemandCategoryContext = createContext<DemandContextData | undefined>(undefined);

const DemandCategoryContextProvider: React.FC<React.PropsWithChildren<{}>> = (props) => {

  const [demandcategories, setDemandCategory] = useState<DemandCategory[]>([]);

  useEffect(() => {
    const fetchDemandCategories = async () => {
      try {
        const response = await api.get('/demandcategory', {
          params: {
            project_id: 1, // Adjust the project ID parameter as needed
          },
        });
        const result: DemandCategory[] = response.data;
        setDemandCategory(result);
      } catch (error) {
        console.error('Error fetching demands:', error);
      }
    };
  
    fetchDemandCategories();
  }, []);
  


  return (
    <DemandCategoryContext.Provider value={{ demandcategories}}>
      {props.children}
    </DemandCategoryContext.Provider>
  );
};

export default DemandCategoryContextProvider;
