import React from "react";
import { Client } from "@/redux/features/clientSlice";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Menu } from "lucide-react"

const ClientCard: React.FC<{
  client: Client;
  onClick: () => void;
  onDeleteClick: (client: Client) => void;
}> = ({ client, onClick, onDeleteClick }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(client);
    setShowMenu(false);
  };

  return (
    <Card
      className="bg-white rounded-lg p-6 cursor-pointer shadow-md transition-all border border-[#ddd] hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onClick()}
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="text-xl font-semibold text-black mb-2">
            {client.name}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              className="border-none text-xl cursor-pointer py-0 px-2"
              onClick={handleMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-full bg-white border border-[#ddd] rounded shadow-md z-10">
                <Button
                  className="block w-full border-none bg-transparent text-left cursor-pointer text-[#dc2626] hover:bg-[#fee2e2]"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-[#666] mb-1">{client.email}</div>
        <div className="text-[#666] mb-1">{client.phone}</div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
