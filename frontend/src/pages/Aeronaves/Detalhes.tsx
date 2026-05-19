import React from 'react';
import { useParams } from 'react-router-dom';

import Layout from '../../components/Layout';

const AeronaveDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <Layout>
      <div className="p-xl">
        <h1 className="text-h2 font-h2 text-on-surface">Detalhes da Aeronave</h1>
        <p className="mt-md text-on-surface-variant">Exibindo detalhes para o ID: {id}</p>
      </div>
    </Layout>
  );
};

export default AeronaveDetalhes;
