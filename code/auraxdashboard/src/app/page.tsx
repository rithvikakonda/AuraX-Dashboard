"use client";

import Footer from "@/components/footer";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import PaginationH from "@/components/pagination/pagination_h";
import {
  setSearchQuery,
  openDeleteModal,
  closeDeleteModal,
  getClients,
  deleteClient,
  Client,
} from "@/redux/features/clientSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import DeleteModal from "@/components/modals/deleteModal";
import ClientCard from "@/components/client_card";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { clients, searchQuery, currentPage, itemsPerPage, deleteModal } =
    useAppSelector((state) => state.clients);

  useEffect(() => {
    dispatch(getClients());
  }, [dispatch]);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaginatedClients = (clients: Client[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clients.slice(startIndex, endIndex);
  };

  const handleDeleteClick = (client: Client) => {
    dispatch(openDeleteModal(client));
  };

  const handleConfirmDelete = () => {
    console.log(deleteModal);
    dispatch(deleteClient(deleteModal.client));
  };

  const handleCancelDelete = () => {
    dispatch(closeDeleteModal());
  };

  const handleClientClick = (id: string) => {
    router.push(`/client_detail?id=${id}`);
  };

  const handleCreateClient = () => {
    router.push("/create_client");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <Header title="CLIENTS">
        <Button
          onClick={handleCreateClient}
          className="gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </Header>

      {/* Responsive Header for Mobile */}
      <div className="hidden max-md:flex items-center justify-between bg-white p-4 shadow-sm sticky top-0 z-40">
        <h1 className="text-xl font-bold">Clients</h1>
        <Button size="sm" onClick={handleCreateClient} variant="outline" className="gap-1">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Client Directory</CardTitle>
                <CardDescription>
                  Manage and view all your clients in one place
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{clients.length} Total Clients</span>
                </div>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Filter clients by name"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-9 pr-4"
              />
            </div>

            <Separator />

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 client-section">
              {filteredClients.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No clients found</p>
                  <p className="text-sm text-center max-w-md">
                    {clients.length === 0
                      ? "Add your first client to get started"
                      : "Try adjusting your search filter"}
                  </p>
                  {clients.length === 0 && (
                    <Button onClick={handleCreateClient} variant="outline" className="mt-4 gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" /> Add Client
                    </Button>
                  )}
                </div>
              ) : (
                getPaginatedClients(filteredClients).map((client) => (
                  <ClientCard
                    key={client.clientId}
                    client={client}
                    onClick={() => handleClientClick(client.clientId)}
                    onDeleteClick={() => handleDeleteClick(client)}
                  />
                ))
              )}
            </div>
          </CardContent>

          {filteredClients.length > 0 && (
            <CardFooter className="flex justify-end border-t pt-6">
              <PaginationH totalItems={filteredClients.length} />
            </CardFooter>
          )}
        </Card>
      </main>

      <Footer />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        clientName={deleteModal.client?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default HomePage;
