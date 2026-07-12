import { Group, IconButton, Menu, Portal } from "@chakra-ui/react";
import { FaAngleUp } from "react-icons/fa";
import type { ReactNode } from "react";

interface SplitButtonProps {
  menuItems: { label: string; value: string }[];
  currentMenuItem: string;
  onMenuItemClick: (value: string) => void;
  onMainButtonClick?: () => void;
  icon: ReactNode;
  isActive: boolean;
}

export const SplitButton = ({
  menuItems,
  currentMenuItem,
  onMenuItemClick,
  onMainButtonClick,
  icon,
  isActive,
}: SplitButtonProps) => {
  return (
    <Menu.Root positioning={{ placement: "top-end" }}>
      <Group attached>
        <IconButton
          variant="outline"
          size="sm"
          aria-label="Device control"
          color={isActive ? "green.400" : "red.500"}
          onClick={onMainButtonClick}
        >
          {icon}
        </IconButton>
        <Menu.Trigger asChild>
          <IconButton variant="outline" size="sm" aria-label="Open device menu">
            <FaAngleUp />
          </IconButton>
        </Menu.Trigger>
      </Group>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.RadioItemGroup
              value={currentMenuItem}
              onValueChange={(e) => onMenuItemClick(e.value)}
            >
              {menuItems.map((item) => (
                <Menu.RadioItem key={item.value} value={item.value}>
                  {item.label}
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
