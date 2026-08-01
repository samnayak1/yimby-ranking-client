import { Tag } from "antd";


interface Props {
  rating: number | null;
}

export default function ScoreBadge({ rating }: Props) {
  if (!rating) {
    return <span className="text-gray-400">—</span>;
  }

  let color: string;

  if (rating >= 8) {
    color = "success";
  } else if (rating <= 4) {
    color = "error";
  } else {
    color = "warning";
  }

  return (
  <Tag color={color} className="font-semibold px-2 py-0.5">
    <span className="text-xl font-bold">{rating}</span>
    <span className="text-[10px] ml-0.5 opacity-70">/10</span>
  </Tag>
);
}