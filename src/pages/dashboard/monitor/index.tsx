import React from 'react';
import Datamining from '@/pages/datamining';

//PmAgreement
//PmInvoice
const monitor: React.FC = () => {
    return (
    //<PageHeaderWrapper>
        <>
            {/* <Datamining moduleName="PmInvoice"></Datamining> */}
            {/* <Datamining moduleName="PmAgreement"></Datamining> */}
            <Datamining moduleName="PmPlanPayoutBalance"></Datamining>
            </>
    //</PageHeaderWrapper>
    )
}

export default monitor;