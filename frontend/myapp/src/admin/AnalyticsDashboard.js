import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { refreshAccessToken } from '../utils/tokenUtils';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,   LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid, } from 'recharts';

import { motion } from 'framer-motion';

const SlideInSection = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}     // start off-screen left
      whileInView={{ opacity: 1, x: 0 }}    // animate to center when in view
      transition={{ duration: 0.9, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }} // trigger only once when 20% in view
      style={{ marginBottom: '30px' }}
    >
      {children}
    </motion.div>
  );
};


const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c','#6cc5deff', '#cb6cdeff'];


const AnalyticsDashboard = () => {
  const [statusData, setStatusData] = useState([]);
  const [userStatusData, setUserStatusData] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [vehicleTypeData, setVehicleTypeData] = useState([]);
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('Application Done');
  const [lineData, setLineData] = useState([]);
  const [lineFilter, setLineFilter] = useState('All');
  const [userChartData, setUserChartData] = useState({});
  const [applicationStatusData, setApplicationStatusData] = useState([]);
  const [renewalStatusData, setRenewalStatusData] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [totalSubmitted, setTotalSubmitted] = useState(0);

 // 'All' | 'Application' | 'Renewal'



const fetchData = async () => {
  try {
    let token = localStorage.getItem('access');
    if (!token) return;

    let response;
    try {
      response = await axios.get('http://localhost:8000/api/all-applications/', {
        headers: { Authorization: `Bearer ${token}` },
      }); 
      console.log(response.data)
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) return;
        response = await axios.get('http://localhost:8000/api/all-applications/', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
      } else {
        throw err;
      }
    }

        const raw = response.data;

        const uniqueUsernames = Array.from(
          new Set(
            raw
              .filter(entry => !entry.is_staff && entry.username)
              .map(entry => entry.username)
          )
        );

        console.log('Unique usernames (after refresh):', uniqueUsernames);

      

      const dateMap = {};

    raw.forEach((app) => {
      const date = new Date(app.created_at).toISOString().split('T')[0];
      const isRenewal = app.is_renewal;

      if (!dateMap[date]) {
        dateMap[date] = { date, application: 0, renewal: 0 };
      }

      if (isRenewal) {
        dateMap[date].renewal += 1;
      } else {
        dateMap[date].application += 1;
      }
    });

    const sorted = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

// Always keep the same data shape
const filteredLineData = sorted.map((entry) => ({
  date: entry.date,
  application: entry.application,
  renewal: entry.renewal,
}));

// Calculate total based on the chosen filter
let total = 0;
if (lineFilter === 'Application') {
  total = sorted.reduce((sum, entry) => sum + entry.application, 0);
} else if (lineFilter === 'Renewal') {
  total = sorted.reduce((sum, entry) => sum + entry.renewal, 0);
} else {
  total = sorted.reduce((sum, entry) => sum + entry.application + entry.renewal, 0);
}

setTotalSubmitted(total);
setLineData(filteredLineData);



      // Group by application status
      // Declare grouped counters

// Initialize grouped counters for applications and renewals
const groupedApplicationStatus = {
  'Checking Application': 0,
  'Application Waiting Approval': 0,
  'Application Done': 0,
  'Application Disapproved': 0,
};

const groupedRenewalStatus = {
  'Checking Renewal': 0,
  'Renewal Waiting Approval': 0,
  'Renewal Done': 0,
};








     let userStatus = {
  'Users Application Done': 0,
  'Users Application Pending': 0,
  'Users Renewal Done': 0,
  'Users Renewal Pending': 0,
};

// Loop through raw application data
raw.forEach((app) => {
  const date = new Date(app.created_at).toISOString().split('T')[0];
  const isRenewal = app.is_renewal;
  const status = app.status;

  // Line chart data grouping
  if (!dateMap[date]) {
    dateMap[date] = { date, application: 0, renewal: 0 };
  }
  if (isRenewal) {
    dateMap[date].renewal += 1;
  } else {
    dateMap[date].application += 1; 
  }

  // Group status data
  if (!isRenewal) {
    if (status === 'Checking Application') groupedApplicationStatus['Checking Application']++;
    else if (status === 'Waiting Approval') groupedApplicationStatus['Application Waiting Approval']++;
    else if (status === 'Application Done') groupedApplicationStatus['Application Done']++;
    else if (status === 'Disapproved') groupedApplicationStatus['Application Disapproved']++;
  } else {
    if (status === 'Checking Renewal') groupedRenewalStatus['Checking Renewal']++;
    else if (status === 'Waiting Approval') groupedRenewalStatus['Renewal Waiting Approval']++;
    else if (status === 'Renewal Done') groupedRenewalStatus['Renewal Done']++;
  }
    const applicationStatusData = Object.entries(groupedApplicationStatus).map(
  ([name, value]) => ({ name, value })
);

const renewalStatusData = Object.entries(groupedRenewalStatus).map(
  ([name, value]) => ({ name, value })
);

   setApplicationStatusData(applicationStatusData);
  setRenewalStatusData(renewalStatusData);
  // User-side status count
  if (!isRenewal) {
    if (app.user_status === 'User Done') {
      userStatus['Users Application Done']++;
    } else {
      userStatus['Users Application Pending']++;
    }
  } else {
    if (app.user_status === 'User Done') {
      userStatus['Users Renewal Done']++;
    } else {
      userStatus['Users Renewal Pending']++;
    }
  }
});



setStatusData({
  application: groupedApplicationStatus,
  renewal: groupedRenewalStatus,
});
setUserChartData(userStatus);

setUniqueUsers(uniqueUsernames);




// Calculate total based on filter








      // Vehicle type counts for "Done" statuses
const vehicleTypeCount = {};

raw.forEach((app) => {
  const isRenewal = app.is_renewal;
  const vehicle = app.vehicle_type || 'Unknown';
  const isAppDone = app.status === 'Application Done';
  const isRenewalDone = app.status === 'Renewal Done';

  const shouldInclude =
    (vehicleStatusFilter === 'All' && (isAppDone || isRenewalDone)) ||
    (vehicleStatusFilter === 'Application Done' && isAppDone && !isRenewal) ||
    (vehicleStatusFilter === 'Renewal Done' && isRenewalDone && isRenewal);

  if (shouldInclude) {
    vehicleTypeCount[vehicle] = (vehicleTypeCount[vehicle] || 0) + 1;
  }
});


const vehicleTypeChartData = Object.entries(vehicleTypeCount).map(([name, value]) => ({
  name,
  value,
}));
setVehicleTypeData(vehicleTypeChartData);




      // Apply type filter to both datasets
     let groupedStatus = {};

if (typeFilter === 'application') {
  groupedStatus = groupedApplicationStatus;
} else if (typeFilter === 'renewal') {
  groupedStatus = groupedRenewalStatus;
} else {
  groupedStatus = {
    ...groupedApplicationStatus,
    ...groupedRenewalStatus,
  };
}



const filteredStatus = Object.entries(groupedStatus)
  .filter(([key]) => {
    if (typeFilter === 'application') return key.toLowerCase().includes('application');
    if (typeFilter === 'renewal') return key.toLowerCase().includes('renewal');
    return true;
  })
  .map(([name, value]) => ({ name, value }));

  


      const filteredUserStatus = Object.entries(userStatus)
        .filter(([key]) => {
          if (typeFilter === 'application') return key.toLowerCase().includes('application');
          if (typeFilter === 'renewal') return key.toLowerCase().includes('renewal');
          return true;
        })
        .map(([name, value]) => ({ name, value }));

      setStatusData(filteredStatus);
      setUserStatusData(filteredUserStatus);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);


// Optional: Prepare the line chart data
useEffect(() => {
  fetchData(); // refetch whenever vehicle status filter changes
}, [vehicleStatusFilter]);
  


useEffect(() => {
  fetchData(); // refetch with new filter
}, [lineFilter]);



  return (
    <div style={{ maxWidth: '1200px', paddingTop: '30px',   margin: 'auto'}}>
      <SlideInSection>

     <div style={{ backgroundColor: '#ffffff', padding: '25px 30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', marginBottom: '40px'}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <h3 style={{ fontSize: '22px', color: '#415572ff', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #065f46' }}>Daily Vehicle Requests - <span style={{ color: '#3b82f6' }}>{lineFilter}</span></h3>
    
    <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
        backgroundColor: '#f3f4f6',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        fontWeight: 'bold',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
Total Submitted: {totalSubmitted}



      </div>
      <button
        onClick={() => setLineFilter('All')}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          backgroundColor: lineFilter === 'All' ? '#3b82f6' : '#f9fafb',
          color: lineFilter === 'All' ? '#fff' : '#374151',
          cursor: 'pointer',
          fontSize: '13px',
          transition: '0.2s',
        }}
      >
        All
      </button>
      <button
        onClick={() => setLineFilter('Application')}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          backgroundColor: lineFilter === 'Application' ? '#3b82f6' : '#f9fafb',
          color: lineFilter === 'Application' ? '#fff' : '#374151',
          cursor: 'pointer',
          fontSize: '13px',
          transition: '0.2s',
        }}
      >
       New Applications
      </button>
      <button
        onClick={() => setLineFilter('Renewal')}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          backgroundColor: lineFilter === 'Renewal' ? '#3b82f6' : '#f9fafb',
          color: lineFilter === 'Renewal' ? '#fff' : '#374151',
          cursor: 'pointer',
          fontSize: '13px',
          transition: '0.2s',
        }}
      >
        Renewals
      </button>
    </div>
  </div>
<div style={{ height: '400px' }}>
  <ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={lineData}
    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
  >
    <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />

    <XAxis
      dataKey="date"
      tick={{ fontSize: 12, fill: '#6b7280' }}
      tickLine={false}
      axisLine={{ stroke: '#e5e7eb' }}
      tickFormatter={(date) =>
        new Date(date).toLocaleString('en-US', {
          month: 'short',   // shorter month to save space
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      }
    />

    <YAxis
      allowDecimals={false}
      tick={{ fontSize: 12, fill: '#6b7280' }}
      tickLine={false}
      axisLine={{ stroke: '#e5e7eb' }}
    />

    <Tooltip
  labelFormatter={(date) =>
    new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  contentStyle={{
    backgroundColor: '#ffffff', 
    border: 'none',         
    borderRadius: 8,            
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
    padding: '8px 12px',        
    fontSize: 15,              
    lineHeight: 1.4,           
  }}
  itemStyle={{
    color: '#111827',          
    fontWeight: 500,          
  }}
  labelStyle={{
    color: '#6b7280',          
    fontWeight: 400,           
    marginBottom: 4,
  }}
/>

    <Legend
      verticalAlign="top"
      align="right"
      iconType="circle"
      height={30}
      wrapperStyle={{ fontSize: 12, color: '#374151' }}
    />

    {lineFilter !== 'Renewal' && (
      <Line
        type="monotone"
        dataKey="application"
        stroke="#3b82f6"
        strokeWidth={2.5}
        dot={{ r: 2 }}
        activeDot={{ r: 5 }}
        name="Applications"
      />
    )}

    {lineFilter !== 'Application' && (
      <Line
        type="monotone"
        dataKey="renewal"
        stroke="#10b981"
        strokeWidth={2.5}
        dot={{ r: 2 }}
        activeDot={{ r: 5 }}
        name="Renewals"
      />
    )}
  </LineChart>
</ResponsiveContainer>


</div>

</div>
</SlideInSection>


      <div style={containerStyle}>
      

<div style={boxStyle}>
  <h3 style={{ fontSize: '22px', color: '#415572ff', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #065f46' }}>New Application Status Overview</h3>
  
  <div style={contentStyle}>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={applicationStatusData}
          cx="50%"
          cy="50%"
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >

          {applicationStatusData.map((entry, index) => (
            <Cell key={`app-cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </PieChart>
    </ResponsiveContainer>

    <div style={listStyle}>
      <h4 style={{ marginBottom: '10px', fontSize: '18px', color: '#065f46' }}>Application Status Counts:</h4>
        <div
    style={{
      marginBottom: '15px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      backgroundColor: '#e0f2f1',
      padding: '10px 12px',
      borderLeft: '4px solid #065f46',
      borderRadius: '6px',
    }}
  >
    Total Applications:{" "}
    <span style={{ fontWeight: 'bold', color: '#065f46' }}>
      {applicationStatusData.reduce((acc, entry) => acc + entry.value, 0)}
    </span>
  </div>
      <ul>
        {applicationStatusData.map((entry, index) => (
        <li
  key={index}
  style={{
    marginBottom: '8px',
    fontSize: '15px',
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: '1px solid #065f46'
  }}
>
  <span style={{ fontWeight: '500' }}>{entry.name}:</span>
  <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '17px', padding: '3px 5px', borderBottom: '1px solid #065f46', borderRadius:'3px'}}>{entry.value}</span>
</li>

        ))}
      </ul>
    </div>
  </div>
</div>


<div style={boxStyle}>

<h3 style={{ fontSize: '22px', color:  '#415572ff', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #065f46' }}>Renewal Status Overview</h3>
<div style={contentStyle}>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={renewalStatusData}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={100}
      fill="#10b981"
      dataKey="value"
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {renewalStatusData.map((entry, index) => (
        <Cell key={`renewal-cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend layout="horizontal" verticalAlign="bottom" />
  </PieChart>
</ResponsiveContainer>

<div style={listStyle}>
  <h4 style={{ marginBottom: '10px', fontSize: '18px', color: '#065f46'}} >Renewal Status Counts:</h4>
    <div
    style={{
      marginBottom: '15px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      backgroundColor: '#e0f2f1',
      padding: '10px 12px',
      borderLeft: '4px solid #065f46',
      borderRadius: '6px',
    }}
  >
    Total Renewals:{" "}
    <span style={{ fontWeight: 'bold', color: '#065f46' }}>
      {renewalStatusData.reduce((acc, entry) => acc + entry.value, 0)}
    </span>
  </div>
  <ul>
    {renewalStatusData.map((entry, index) => (
       <li
  key={index}
  style={{
    marginBottom: '8px',
    fontSize: '15px',
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: '1px solid #065f46'
  }}
>  <span style={{ fontWeight: '500' }}>{entry.name}:</span>
  <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '17px', padding: '3px 5px', borderBottom: '1px solid #065f46', borderRadius:'3px'}}>{entry.value}</span>
</li>
    ))}
  </ul>
</div>
</div>
</div>

<div style={boxStyle}>
      {/* Second Chart: User Status (Done vs Pending) */}
      <h3 style={{ fontSize: '22px', color:  '#415572ff', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #065f46' }}>User Application Status </h3>
<div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
  <button
    onClick={() => setTypeFilter('all')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: typeFilter === 'all' ? '#3b82f6' : '#f9fafb',
      color: typeFilter === 'all' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    All
  </button>
  <button
    onClick={() => setTypeFilter('application')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: typeFilter === 'application' ? '#3b82f6' : '#f9fafb',
      color: typeFilter === 'application' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    Application
  </button>
  <button
    onClick={() => setTypeFilter('renewal')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: typeFilter === 'renewal' ? '#3b82f6' : '#f9fafb',
      color: typeFilter === 'renewal' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    Renewal
  </button>
</div>

      <div style={contentStyle}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={userStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#82ca9d"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {userStatusData.map((entry, index) => (
              <Cell key={`user-status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>

      {/* User Status Count */}
      <div style={listStyle}>
        <h4  style={{ marginBottom: '10px', fontSize: '18px', color: '#065f46'}}>User Status Counts:</h4>
         <div
    style={{
      marginBottom: '15px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      backgroundColor: '#e0f2f1',
      padding: '10px 12px',
      borderLeft: '4px solid #065f46',
      borderRadius: '6px',
    }}
  >
Total Users:{" "}
<span style={{ fontWeight: 'bold', color: '#065f46' }}>
  {uniqueUsers.length}
</span>




  </div>
        <ul>
          {userStatusData.map((entry, index) => (
             <li
  key={index}
  style={{
    marginBottom: '8px',
    fontSize: '15px',
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: '1px solid #065f46'
  }}
> <span style={{ fontWeight: '500' }}>{entry.name}:</span>
  <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '17px', padding: '3px 5px', borderBottom: '1px solid #065f46', borderRadius:'3px'}}>{entry.value}</span>
</li>
          ))}
        </ul>
      </div>

 
      </div>
      </div>


      <div style={boxStyle}>
        

<h3 style={{ fontSize: '22px', color:  '#415572ff', marginBottom: '10px', paddingLeft: '5px', borderLeft: '4px solid #065f46' }}>Vehicle Type Distribution - {vehicleStatusFilter}</h3>
<div style={{ display: 'flex', gap: '10px' }}>
  <button
    onClick={() => setVehicleStatusFilter('All')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: vehicleStatusFilter === 'All' ? '#3b82f6' : '#f9fafb',
      color: vehicleStatusFilter === 'All' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    All
  </button>

  <button
    onClick={() => setVehicleStatusFilter('Application Done')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: vehicleStatusFilter === 'Application Done' ? '#3b82f6' : '#f9fafb',
      color: vehicleStatusFilter === 'Application Done' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    New Application
  </button>

  <button
    onClick={() => setVehicleStatusFilter('Renewal Done')}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: vehicleStatusFilter === 'Renewal Done' ? '#3b82f6' : '#f9fafb',
      color: vehicleStatusFilter === 'Renewal Done' ? '#fff' : '#374151',
      cursor: 'pointer',
      fontSize: '13px',
      transition: '0.2s',
    }}
  >
    Renewal
  </button>
</div>


<div style={contentStyle}>


<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={vehicleTypeData}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={100}
      fill="#ffc658"
      dataKey="value"
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {vehicleTypeData.map((entry, index) => (
        <Cell key={`vehicle-type-cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend layout="horizontal" verticalAlign="bottom" />
  </PieChart>
</ResponsiveContainer>

{/* Vehicle Type Count Display */}
<div style={listStyle}>
  <h4 style={{ marginBottom: '10px', fontSize: '18px', color: '#065f46'}}>Vehicle Type Counts:</h4>
  <div
    style={{
      marginBottom: '15px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      backgroundColor: '#e0f2f1',
      padding: '10px 12px',
      borderLeft: '4px solid #065f46',
      borderRadius: '6px',
    }}
  >
    Total Vehicle Distribution:{" "}
    <span style={{ fontWeight: 'bold', color: '#065f46' }}>
      {vehicleTypeData.reduce((acc, entry) => acc + entry.value, 0)}
    </span>
  </div>
  <ul>
    {vehicleTypeData.map((entry, index) => (
       <li
  key={index}
  style={{
    marginBottom: '8px',
    fontSize: '15px',
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: '1px solid #065f46'
  }}
> <span style={{ fontWeight: '500' }}>{entry.name}:</span>
  <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '17px', padding: '3px 5px', borderBottom: '1px solid #065f46', borderRadius:'3px'}}>{entry.value}</span>
</li>
    ))}
  </ul>
</div>
</div>
</div>


    </div>
    </div>
  );
};



const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',


}

const boxStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '30px',
  marginBottom: '40px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '30px',
};

const listStyle = {
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  border: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column', 
  width: '500px',
  padding: '20px'
  
};



export default AnalyticsDashboard;
