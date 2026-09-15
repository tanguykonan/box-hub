export interface BoxVersion {
  tag: string;
  version: string;
  date: string;
  size: string;
  pulls: string;
  readme?: string;
  envExample?: string;
}

export interface BoxDetail {
  id: string;
  name: string;
  author: string;
  tag: string;
  version: string;
  updatedAt: string;
  description: string;
  size: string;
  pulls: string;
  stars: number;
  runtime: {
    type: "python" | "node";
    version: string;
    runtimeName: string;
  };
  language?: "Python" | "JavaScript" | "TypeScript";
  protected: boolean;
  category: "bots" | "api" | "ai" | "tools";
  boxConfig: {
    entrypoint: string;
    network: string;
    volumes: string[];
    ports?: string[];
  };
  envExample: string;
  readme: string;
  versions: BoxVersion[];
}


