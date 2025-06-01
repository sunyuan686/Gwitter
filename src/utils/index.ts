import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

export const parseUrl = (
  search = window.location.search,
): Record<string, string> => {
  if (!search) return {};
  const queryString = search[0] === '?' ? search.substring(1) : search;
  const query: Record<string, string> = {};
  queryString.split('&').forEach((queryStr) => {
    const [key, value] = queryStr.split('=');
    if (key) {
      query[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return query;
};

export const throttle = (func: Function, wait: number, options?: any) => {
  let context: unknown;
  let args: any;
  let result: any;
  let timeout: any;
  let previous = 0;
  if (!options) {
    options = {};
  }
  let later = function () {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };
  return function (this: unknown) {
    context = this;
    let now = new Date().getTime();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

export const formatErrorMsg = (error: any): string => {
  if (error.response) {
    const { status, statusText } = error.response;
    return `${status}: ${statusText}`;
  }
  return error.message || 'An unknown error occurred';
};

export interface Label {
  name: string;
  color: string;
}

export interface RawIssue {
  id: string;
  number: number;
  createdAt: string;
  bodyHTML: string;
  comments: {
    totalCount: number;
  };
  labels: {
    nodes: Label[];
  };
}

export interface ProcessedIssue {
  id: string;
  number: number;
  createdAt: string;
  bodyHTML: string;
  comments: number;
  label: Label;
}

const transformLabel = (labels: Label[]): Label => {
  if (!labels || labels.length === 0) {
    return {
      name: 'default',
      color: '1da1f2',
    };
  }
  return labels[0];
};

export const transformIssues = (rawIssues: RawIssue[]): ProcessedIssue[] => {
  return rawIssues.map(
    ({ id, number, createdAt, bodyHTML, comments, labels }) => {
      return {
        id,
        number,
        createdAt,
        bodyHTML,
        comments: comments.totalCount,
        label: transformLabel(labels.nodes),
      };
    },
  );
};

export const formatDate = (_date: string | Date, language = 'zh') => {
  const date = new Date(_date);
  const now = new Date();
  const locale = ['zh', 'zh-CN'].includes(language) ? zhCN : enUS;
  const formattedDate = formatDistance(date, now, {
    addSuffix: true,
    locale,
  });

  if (locale === zhCN) {
    if (formattedDate.includes('秒') || formattedDate.includes('分钟')) {
      return formattedDate;
    }

    if (formattedDate.includes('小时') || formattedDate.includes('昨天')) {
      return formatRelative(date, now, { locale });
    }

    if (formattedDate.includes('天')) {
      return formattedDate;
    }
  } else {
    if (formattedDate.includes('second') || formattedDate.includes('minute')) {
      return formattedDate;
    }

    if (formattedDate.includes('hour') || formattedDate.includes('yesterday')) {
      return formatRelative(date, now, { locale });
    }

    if (formattedDate.includes('day')) {
      return formattedDate;
    }
  }

  return format(date, 'yyyy-MM-dd', { locale });
};

export const getColorByBgColor = (hexcolor: string) => {
  let r = parseInt(hexcolor.substr(0, 2), 16);
  let g = parseInt(hexcolor.substr(2, 2), 16);
  let b = parseInt(hexcolor.substr(4, 2), 16);
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
};