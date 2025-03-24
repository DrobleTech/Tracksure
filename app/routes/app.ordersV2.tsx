import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import OrdersTable from '../components/Orders/OrdersTable';
import { Button } from '../components/ui/button';
import { useToast } from "../hooks/use-toast";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useSubmit } from "@remix-run/react";
import { PrismaClient } from '@prisma/client';
import { ActionFunctionArgs } from "@remix-run/node";
import { cancelOrders } from "../services/cancelOrders.server";
const prisma = new PrismaClient();

export const loader = async () => {
  const orders = await prisma.order.findMany({
    orderBy: {
      orderDate: 'desc'
    },
    select: {
      id: true,
      orderId: true,
      orderDate: true,
      name: true,
      email: true,
      phone: true,
      productName: true,
      payment: true,
      paymentMethod: true,
      paymentValue: true,
      tier: true,
      address: true,
      customerId: true,
      riskVerification: true,
      tags: true,
      otp: true,
      ivr: true,
      shipmentStatus: true,
      qualityScore: true,
      tierCity: true,
      deliveryTime: true,
      flagged: true,
      shippable: true,
      cancelledAt: true,
      closed: true
    }
  });

  return json({ orders });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const orderIds = formData.get("orderIds")?.toString().split(",") || [];
  
  try {
    await cancelOrders(request, orderIds);
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: "Failed to cancel orders" }, { status: 400 });
  }
};

const Orders = () => {
  const { orders } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const submit = useSubmit();
  const [threshold, setThreshold] = useState(75);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    dateRange: { from: Date | undefined; to: Date | undefined };
    datePreset: string;
    onlyBelowThreshold: boolean;
    onlyAboveThreshold: boolean;
    orderStatus: string[];
    tierCity: string[];
    deliveryTime: string[];
    verificationStatus: string[];
    tags: string[];
    scoreRange: [number, number];
    searchQuery: string;
  }>({
    dateRange: { from: undefined, to: undefined },
    datePreset: 'today',
    onlyBelowThreshold: false,
    onlyAboveThreshold: false,
    orderStatus: [],
    tierCity: [],
    deliveryTime: [],
    verificationStatus: [],
    tags: [],
    scoreRange: [0, 100],
    searchQuery: '',
  });

  const handleCancelOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to cancel",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("orderIds", selectedOrders.join(","));
      
      await submit(formData, { method: "post" });
      
      toast({
        title: `${selectedOrders.length} orders cancelled`,
        description: "Selected orders have been cancelled successfully"
      });
      
      setSelectedOrders([]);
    } catch (error) {
      toast({
        title: "Error cancelling orders",
        description: "There was a problem cancelling the selected orders",
        variant: "destructive"
      });
    }
  };

  const handleSingleOrderCancel = (orderId: string) => {
    const formData = new FormData();
    formData.append("orderIds", orderId);
    submit(formData, { method: "post" });
  };

  return (
    <div className="w-full px-4 py-6 max-w-none">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-trackscore-text">Order Management</h1>
          <p className="text-slate-500 mt-1">
            View, filter, and manage all your orders with TrackScore quality ratings
          </p>
        </div>
      </div>
      
      {selectedOrders.length > 0 && (
        <div className="mb-6 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center">
            <span className="font-medium">{selectedOrders.length} orders selected</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              Clear selection
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleCancelOrders}
            >
              Cancel orders
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 w-full">
        <OrdersTable 
          orders={orders}
          threshold={threshold} 
          filters={appliedFilters}
          selectedOrders={selectedOrders}
          onSelectOrders={setSelectedOrders}
          onCancelOrder={(orderId) => {
            const formData = new FormData();
            formData.append("orderIds", orderId);
            submit(formData, { method: "post" });
          }}
        />
      </div>
    </div>
  );
};

export default Orders;
